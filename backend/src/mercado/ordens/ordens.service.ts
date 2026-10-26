import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { OrdensRepositorio } from './ordens.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { CooperativaRepositorio } from '../cooperativa/cooperativa.repository';
import { TransacoesRepositorio } from '../transacoes/transacoes.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import { EstoqueServico } from '../estoque/estoque.service';
import { CotacoesServico } from '../cotacoes/cotacoes.service';
import { UsuarioLogado } from '../shared/mercado.types';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { ComprarDto } from './dto/comprar.dto';
import { FiltroOrdemDto } from './dto/filtro-ordem.dto';

@Injectable()
export class OrdensServico {
  constructor(
    private readonly ordensRepositorio: OrdensRepositorio,
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly cooperativaRepositorio: CooperativaRepositorio,
    private readonly transacoesRepositorio: TransacoesRepositorio,
    private readonly contextoRepositorio: ContextoMercadoRepositorio,
    private readonly estoqueServico: EstoqueServico,
    private readonly cotacoesServico: CotacoesServico,
  ) {}

  findAll(filtro: FiltroOrdemDto, usuario: UsuarioLogado) {
    return this.ordensRepositorio.findAll(filtro, usuario);
  }

  async findOne(id: string, usuario: UsuarioLogado) {
    const ordem = await this.ordensRepositorio.findOne(id);
    if (!ordem) {
      throw new NotFoundException('Ordem não encontrada.');
    }
    if (usuario.perfil === 'admin' || ordem.usuarioId === usuario.id) {
      return ordem;
    }

    const ofertaAberta =
      ordem.tipo === 'VENDA' &&
      ordem.modalidade === 'AVULSA' &&
      ordem.status === 'ABERTA';
    if (usuario.perfil === 'comprador' && ofertaAberta) {
      return ordem;
    }

    if (usuario.perfil === 'professor' && ordem.fazendaId) {
      const fazenda = await this.contextoRepositorio.buscarFazenda(
        ordem.fazendaId,
      );
      if (
        fazenda?.turmaId &&
        (await this.contextoRepositorio.professorDaTurma(
          fazenda.turmaId,
          usuario.id,
        ))
      ) {
        return ordem;
      }
    }

    throw new ForbiddenException('Você não pode ver essa ordem.');
  }

  vender(dados: CriarVendaDto, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const fazenda = await this.estoqueServico.fazendaDoAluno(
        dados.fazendaId,
        usuario,
        trx,
      );
      const produto = await this.buscarProduto(dados.produtoId, trx, true);

      await this.estoqueServico.ajustar(
        fazenda.id,
        produto.chaveEstoque,
        -dados.quantidade,
        trx,
      );

      return this.ordensRepositorio.create(
        {
          tipo: 'VENDA',
          modalidade: 'AVULSA',
          status: 'ABERTA',
          produtoId: produto.id,
          usuarioId: usuario.id,
          fazendaId: fazenda.id,
          temporada: fazenda.temporadaAtual,
          quantidade: dados.quantidade,
        },
        trx,
      );
    });
  }

  cancelar(id: string, usuario: UsuarioLogado) {
    return database.transaction(async (trx) => {
      const ordem = await this.ordensRepositorio.findOne(id, trx);
      if (!ordem || ordem.tipo !== 'VENDA' || ordem.modalidade !== 'AVULSA') {
        throw new NotFoundException('Oferta avulsa não encontrada.');
      }
      if (usuario.perfil !== 'admin' && ordem.usuarioId !== usuario.id) {
        throw new ForbiddenException('Essa oferta não é sua.');
      }

      const canceladas = await this.ordensRepositorio.fecharSeAberta(
        id,
        { status: 'CANCELADA' },
        trx,
      );
      if (canceladas === 0) {
        throw new ConflictException('Essa oferta não está mais aberta.');
      }

      const produto = await this.buscarProduto(ordem.produtoId, trx);
      await this.estoqueServico.ajustar(
        ordem.fazendaId as string,
        produto.chaveEstoque,
        Number(ordem.quantidade),
        trx,
      );

      return { ...ordem, status: 'CANCELADA' };
    });
  }

  async comprar(dados: ComprarDto, usuario: UsuarioLogado) {
    const compra = await database.transaction((trx) => {
      if (dados.origem === 'ORDEM') {
        return this.comprarOferta(dados.origemId, usuario, trx);
      }
      return this.comprarVendaConjunta(dados.origemId, usuario, trx);
    });

    await this.cotacoesServico.limparCache(compra.produtoId);
    return compra;
  }

  private async comprarOferta(
    ordemId: string,
    usuario: UsuarioLogado,
    trx: Knex.Transaction,
  ) {
    const oferta = await this.ordensRepositorio.findOne(ordemId, trx);
    if (
      !oferta ||
      oferta.tipo !== 'VENDA' ||
      oferta.modalidade !== 'AVULSA' ||
      !oferta.fazendaId
    ) {
      throw new NotFoundException('Oferta avulsa não encontrada.');
    }

    const fazenda = await this.contextoRepositorio.buscarFazenda(
      oferta.fazendaId,
      trx,
    );
    if (!fazenda || !fazenda.turmaId) {
      throw new UnprocessableEntityException(
        'A fazenda da oferta não está ligada a uma turma.',
      );
    }

    const quantidade = Number(oferta.quantidade);
    const { produto, ...cotacao } = await this.cotacoesServico.buscarParaVenda(
      oferta.produtoId,
      fazenda.turmaId,
      fazenda.temporadaAtual,
      trx,
    );
    const valor = this.valorDaCompra(quantidade, cotacao.precoAtual);

    const executadas = await this.ordensRepositorio.fecharSeAberta(
      oferta.id,
      {
        status: 'EXECUTADA',
        precoUnitario: cotacao.precoAtual,
        valorTotal: valor,
      },
      trx,
    );
    if (executadas === 0) {
      throw new ConflictException('Essa oferta não está mais aberta.');
    }

    const compra = await this.ordensRepositorio.create(
      {
        tipo: 'COMPRA',
        modalidade: 'AVULSA',
        status: 'EXECUTADA',
        produtoId: oferta.produtoId,
        usuarioId: usuario.id,
        fazendaId: fazenda.id,
        ordemOrigemId: oferta.id,
        temporada: fazenda.temporadaAtual,
        quantidade,
        precoUnitario: cotacao.precoAtual,
        valorTotal: valor,
      },
      trx,
    );

    await this.transacoesRepositorio.create(
      {
        tipo: 'COMPRA_AVULSA',
        ordemId: compra.id,
        compradorId: usuario.id,
        beneficiarioId: oferta.usuarioId,
        fazendaId: fazenda.id,
        valor,
      },
      trx,
    );
    await this.cotacoesServico.registrarVenda(
      cotacao,
      produto,
      quantidade,
      trx,
    );

    return compra;
  }

  private async comprarVendaConjunta(
    vendaConjuntaId: string,
    usuario: UsuarioLogado,
    trx: Knex.Transaction,
  ) {
    const venda = await this.cooperativaRepositorio.buscarParaAtualizar(
      vendaConjuntaId,
      trx,
    );
    if (!venda) {
      throw new NotFoundException('Venda conjunta não encontrada.');
    }
    if (venda.status !== 'ABERTA') {
      throw new ConflictException('Essa venda conjunta não está aberta.');
    }

    const contribuicoes = await this.ordensRepositorio.listarContribuicoes(
      venda.id,
      'ABERTA',
      trx,
    );

    const fazendas: string[] = [];
    let quantidade = 0;
    for (const contribuicao of contribuicoes) {
      if (!fazendas.includes(contribuicao.fazendaId as string)) {
        fazendas.push(contribuicao.fazendaId as string);
      }
      quantidade += Number(contribuicao.quantidade);
    }
    if (fazendas.length < 2) {
      throw new UnprocessableEntityException(
        'A venda conjunta precisa de contribuições de pelo menos duas fazendas.',
      );
    }

    const { produto, ...cotacao } = await this.cotacoesServico.buscarParaVenda(
      venda.produtoId,
      venda.turmaId,
      venda.temporada,
      trx,
    );
    const valor = this.valorDaCompra(quantidade, cotacao.precoAtual);

    const compra = await this.ordensRepositorio.create(
      {
        tipo: 'COMPRA',
        modalidade: 'CONJUNTA',
        status: 'EXECUTADA',
        produtoId: venda.produtoId,
        usuarioId: usuario.id,
        vendaConjuntaId: venda.id,
        temporada: venda.temporada,
        quantidade,
        precoUnitario: cotacao.precoAtual,
        valorTotal: valor,
      },
      trx,
    );

    await this.ordensRepositorio.executarContribuicoes(
      venda.id,
      cotacao.precoAtual,
      trx,
    );
    await this.cooperativaRepositorio.update(
      venda.id,
      { status: 'AGUARDANDO_DISTRIBUICAO', valorBruto: valor },
      trx,
    );
    await this.transacoesRepositorio.create(
      {
        tipo: 'COMPRA_CONJUNTA',
        ordemId: compra.id,
        vendaConjuntaId: venda.id,
        compradorId: usuario.id,
        valor,
      },
      trx,
    );
    await this.cotacoesServico.registrarVenda(
      cotacao,
      produto,
      quantidade,
      trx,
    );

    return compra;
  }

  private valorDaCompra(quantidade: number, preco: number) {
    const valor = Number((quantidade * preco).toFixed(2));
    if (valor < 0.01) {
      throw new UnprocessableEntityException(
        'O valor da compra precisa ser de pelo menos R$ 0,01.',
      );
    }
    return valor;
  }

  private async buscarProduto(
    id: string,
    trx: Knex.Transaction,
    precisaEstarAtivo = false,
  ) {
    const produto = await this.produtosRepositorio.findOne(id, trx);
    if (!produto || (precisaEstarAtivo && !produto.ativo)) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }
    return produto;
  }
}
