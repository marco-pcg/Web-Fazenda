import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { CooperativaRepositorio } from './cooperativa.repository';
import { OrdensRepositorio } from '../ordens/ordens.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { TransacoesRepositorio } from '../transacoes/transacoes.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import { EstoqueServico } from '../estoque/estoque.service';
import { UsuarioLogado } from '../shared/mercado.types';
import { CriarVendaDto } from '../ordens/dto/criar-venda.dto';
import { ContribuirDto } from './dto/contribuir.dto';
import { AlterarContribuicaoDto } from './dto/alterar-contribuicao.dto';
import { FiltroVendaConjuntaDto } from './dto/filtro-venda-conjunta.dto';

const TAXA_COOPERATIVA = 0.05;

@Injectable()
export class CooperativaServico {
  constructor(
    private readonly cooperativaRepositorio: CooperativaRepositorio,
    private readonly ordensRepositorio: OrdensRepositorio,
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly transacoesRepositorio: TransacoesRepositorio,
    private readonly contextoRepositorio: ContextoMercadoRepositorio,
    private readonly estoqueServico: EstoqueServico,
  ) {}

  findAll(filtro: FiltroVendaConjuntaDto, usuario: UsuarioLogado) {
    return this.cooperativaRepositorio.findAll(filtro, usuario);
  }

  async findOne(id: string, usuario: UsuarioLogado) {
    const venda = await this.cooperativaRepositorio.findOne(id);
    if (!venda) {
      throw new NotFoundException('Venda conjunta não encontrada.');
    }

    if (usuario.perfil === 'aluno') {
      const participa = await this.contextoRepositorio.alunoTemFazendaNaTurma(
        venda.turmaId,
        usuario.id,
      );
      if (!participa) {
        throw new ForbiddenException('Essa venda conjunta é de outra turma.');
      }
    }
    if (usuario.perfil === 'professor') {
      const ehProfessor = await this.contextoRepositorio.professorDaTurma(
        venda.turmaId,
        usuario.id,
      );
      if (!ehProfessor) {
        throw new ForbiddenException('Essa venda conjunta é de outra turma.');
      }
    }

    const abertas = await this.ordensRepositorio.listarContribuicoes(
      id,
      'ABERTA',
    );
    const executadas = await this.ordensRepositorio.listarContribuicoes(
      id,
      'EXECUTADA',
    );
    const contribuicoes = [...abertas, ...executadas];

    let quantidade = 0;
    for (const contribuicao of contribuicoes) {
      quantidade += Number(contribuicao.quantidade);
    }

    return { ...venda, quantidade, contribuicoes };
  }

  create(dados: CriarVendaDto, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const fazenda = await this.estoqueServico.fazendaDoAluno(
        dados.fazendaId,
        usuario,
        trx,
      );
      const produto = await this.produtosRepositorio.findOne(
        dados.produtoId,
        trx,
      );
      if (!produto || !produto.ativo) {
        throw new NotFoundException('Produto não encontrado ou inativo.');
      }

      await this.estoqueServico.ajustar(
        fazenda.id,
        produto.chaveEstoque,
        -dados.quantidade,
        trx,
      );

      const venda = await this.cooperativaRepositorio.create(
        {
          produtoId: produto.id,
          turmaId: fazenda.turmaId as string,
          criadorId: usuario.id,
          temporada: fazenda.temporadaAtual,
          status: 'ABERTA',
        },
        trx,
      );

      const contribuicao = await this.ordensRepositorio.create(
        {
          tipo: 'VENDA',
          modalidade: 'CONJUNTA',
          status: 'ABERTA',
          produtoId: produto.id,
          usuarioId: usuario.id,
          fazendaId: fazenda.id,
          vendaConjuntaId: venda.id,
          temporada: fazenda.temporadaAtual,
          quantidade: dados.quantidade,
        },
        trx,
      );

      return { ...venda, contribuicoes: [contribuicao] };
    });
  }

  contribuir(id: string, dados: ContribuirDto, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const venda = await this.vendaAberta(id, trx);
      const fazenda = await this.estoqueServico.fazendaDoAluno(
        dados.fazendaId,
        usuario,
        trx,
      );

      if (
        fazenda.turmaId !== venda.turmaId ||
        fazenda.temporadaAtual !== venda.temporada
      ) {
        throw new UnprocessableEntityException(
          'A fazenda precisa ser da mesma turma e temporada da venda conjunta.',
        );
      }

      const jaContribuiu =
        await this.ordensRepositorio.buscarContribuicaoAberta(
          id,
          fazenda.id,
          trx,
        );
      if (jaContribuiu) {
        throw new ConflictException(
          'Essa fazenda já contribuiu. Altere a contribuição existente.',
        );
      }

      const chave = await this.chaveDoProduto(venda.produtoId, trx);
      await this.estoqueServico.ajustar(
        fazenda.id,
        chave,
        -dados.quantidade,
        trx,
      );

      return this.ordensRepositorio.create(
        {
          tipo: 'VENDA',
          modalidade: 'CONJUNTA',
          status: 'ABERTA',
          produtoId: venda.produtoId,
          usuarioId: usuario.id,
          fazendaId: fazenda.id,
          vendaConjuntaId: id,
          temporada: fazenda.temporadaAtual,
          quantidade: dados.quantidade,
        },
        trx,
      );
    });
  }

  alterar(
    id: string,
    ordemId: string,
    dados: AlterarContribuicaoDto,
    usuario: UsuarioLogado,
  ) {
    return database.transaction(async (trx) => {
      const venda = await this.vendaAberta(id, trx);
      const contribuicao = await this.minhaContribuicao(
        id,
        ordemId,
        usuario,
        trx,
      );

      const chave = await this.chaveDoProduto(venda.produtoId, trx);
      await this.estoqueServico.ajustar(
        contribuicao.fazendaId as string,
        chave,
        Number(contribuicao.quantidade) - dados.quantidade,
        trx,
      );

      await this.ordensRepositorio.update(
        ordemId,
        { quantidade: dados.quantidade },
        trx,
      );
      return { ...contribuicao, quantidade: dados.quantidade };
    });
  }

  retirar(id: string, ordemId: string, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const venda = await this.vendaAberta(id, trx);
      const contribuicao = await this.minhaContribuicao(
        id,
        ordemId,
        usuario,
        trx,
      );

      const chave = await this.chaveDoProduto(venda.produtoId, trx);
      await this.estoqueServico.ajustar(
        contribuicao.fazendaId as string,
        chave,
        Number(contribuicao.quantidade),
        trx,
      );
      await this.ordensRepositorio.update(
        ordemId,
        { status: 'CANCELADA' },
        trx,
      );

      const restantes = await this.ordensRepositorio.listarContribuicoes(
        id,
        'ABERTA',
        trx,
      );
      if (restantes.length === 0) {
        await this.cooperativaRepositorio.update(
          id,
          { status: 'CANCELADA' },
          trx,
        );
        return {
          mensagem: 'Contribuição retirada e venda conjunta cancelada.',
        };
      }

      return { mensagem: 'Contribuição retirada com sucesso.' };
    });
  }

  distribuir(id: string, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const venda = await this.cooperativaRepositorio.buscarParaAtualizar(
        id,
        trx,
      );
      if (!venda) {
        throw new NotFoundException('Venda conjunta não encontrada.');
      }
      if (usuario.perfil !== 'admin' && venda.criadorId !== usuario.id) {
        throw new ForbiddenException(
          'Só quem criou a venda conjunta ou o admin pode distribuir.',
        );
      }
      if (venda.status !== 'AGUARDANDO_DISTRIBUICAO') {
        throw new ConflictException(
          'A venda conjunta não está aguardando distribuição.',
        );
      }

      const contribuicoes = await this.ordensRepositorio.listarContribuicoes(
        id,
        'EXECUTADA',
        trx,
      );
      if (contribuicoes.length === 0) {
        throw new UnprocessableEntityException(
          'A venda conjunta não tem contribuições.',
        );
      }

      const resultado = this.calcularDistribuicao(
        Number(venda.valorBruto),
        contribuicoes.map((contribuicao) => Number(contribuicao.quantidade)),
      );

      const repasses: { fazendaId: string | null; valor: number }[] = [];
      for (let i = 0; i < contribuicoes.length; i++) {
        await this.transacoesRepositorio.create(
          {
            tipo: 'REPASSE',
            ordemId: contribuicoes[i].id,
            vendaConjuntaId: id,
            beneficiarioId: contribuicoes[i].usuarioId,
            fazendaId: contribuicoes[i].fazendaId,
            valor: resultado.repasses[i],
          },
          trx,
        );
        repasses.push({
          fazendaId: contribuicoes[i].fazendaId,
          valor: resultado.repasses[i],
        });
      }

      await this.transacoesRepositorio.create(
        { tipo: 'TAXA', vendaConjuntaId: id, valor: resultado.taxa },
        trx,
      );
      await this.cooperativaRepositorio.update(
        id,
        {
          status: 'DISTRIBUIDA',
          taxa: resultado.taxa,
          valorLiquido: resultado.valorLiquido,
        },
        trx,
      );

      return {
        vendaConjuntaId: id,
        valorBruto: resultado.valorBruto,
        taxa: resultado.taxa,
        valorLiquido: resultado.valorLiquido,
        repasses,
      };
    });
  }

  private calcularDistribuicao(valorBruto: number, quantidades: number[]) {
    const brutoCentavos = Math.round(valorBruto * 100);
    const taxaCentavos = Math.round(brutoCentavos * TAXA_COOPERATIVA);
    const liquidoCentavos = brutoCentavos - taxaCentavos;

    let quantidadeTotal = 0;
    for (const quantidade of quantidades) {
      quantidadeTotal += quantidade;
    }

    const parcelas: number[] = [];
    const sobras: { posicao: number; sobra: number }[] = [];
    let distribuido = 0;

    for (let i = 0; i < quantidades.length; i++) {
      const exato = (liquidoCentavos * quantidades[i]) / quantidadeTotal;
      const centavos = Math.floor(exato);
      parcelas.push(centavos);
      sobras.push({ posicao: i, sobra: exato - centavos });
      distribuido += centavos;
    }

    sobras.sort((a, b) => b.sobra - a.sobra);
    const restante = liquidoCentavos - distribuido;
    for (let i = 0; i < restante; i++) {
      parcelas[sobras[i].posicao] += 1;
    }

    return {
      valorBruto: brutoCentavos / 100,
      taxa: taxaCentavos / 100,
      valorLiquido: liquidoCentavos / 100,
      repasses: parcelas.map((centavos) => centavos / 100),
    };
  }

  private async vendaAberta(id: string, trx: Knex.Transaction) {
    const venda = await this.cooperativaRepositorio.buscarParaAtualizar(
      id,
      trx,
    );
    if (!venda) {
      throw new NotFoundException('Venda conjunta não encontrada.');
    }
    if (venda.status !== 'ABERTA') {
      throw new ConflictException('Essa venda conjunta não está aberta.');
    }
    return venda;
  }

  private async minhaContribuicao(
    vendaConjuntaId: string,
    ordemId: string,
    usuario: UsuarioLogado,
    trx: Knex.Transaction,
  ) {
    const contribuicao = await this.ordensRepositorio.findOne(ordemId, trx);
    if (!contribuicao || contribuicao.vendaConjuntaId !== vendaConjuntaId) {
      throw new NotFoundException('Contribuição não encontrada.');
    }
    if (contribuicao.usuarioId !== usuario.id) {
      throw new ForbiddenException('Essa contribuição não é sua.');
    }
    if (contribuicao.status !== 'ABERTA') {
      throw new ConflictException('Essa contribuição não está aberta.');
    }
    return contribuicao;
  }

  private async chaveDoProduto(produtoId: string, trx: Knex.Transaction) {
    const produto = await this.produtosRepositorio.findOne(produtoId, trx);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto.chaveEstoque;
  }
}
