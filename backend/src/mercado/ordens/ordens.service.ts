import { database as bancoDeDados } from '../../db/knex-connection';
import { OrdensRepositorio } from './ordens.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { CooperativaRepositorio } from '../cooperativa/cooperativa.repository';
import { TransacoesRepositorio } from '../transacoes/transacoes.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstoqueServico } from '../estoque/estoque.service';
import { CotacoesServico } from '../cotacoes/cotacoes.service';
import { UsuarioMercado } from '../shared/mercado.types';
import { ComprarDto } from './dto/comprar.dto';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { FiltroOrdensDto } from './dto/filtro-ordens.dto';

@Injectable()
export class OrdensServico {
  constructor(
    private readonly ordensRepositorio: OrdensRepositorio,
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly cooperativaRepositorio: CooperativaRepositorio,
    private readonly transacoesRepositorio: TransacoesRepositorio,
    private readonly contextoMercadoRepositorio: ContextoMercadoRepositorio,
    private readonly estoque: EstoqueServico,
    private readonly cotacoes: CotacoesServico,
  ) {}

  async listar(filtro: FiltroOrdensDto, usuario: UsuarioMercado) {
    this.verificarPerfilConsulta(usuario);
    return this.ordensRepositorio.listar(filtro, usuario);
  }

  async detalhe(id: string, usuario: UsuarioMercado) {
    const ordem = await this.ordensRepositorio.buscarPorId(id);
    if (!ordem) {
      throw new NotFoundException('Ordem não encontrada.');
    }
    if (usuario.perfil === 'admin' || ordem.usuario_id === usuario.id) {
      return ordem;
    }
    if (
      usuario.perfil === 'comprador' &&
      ordem.tipo === 'VENDA' &&
      ordem.modalidade === 'AVULSA' &&
      ordem.status === 'ABERTA'
    ) {
      return ordem;
    }
    if (usuario.perfil === 'professor' && ordem.fazenda_id) {
      const fazenda = await this.contextoMercadoRepositorio.buscarFazenda(
        ordem.fazenda_id,
      );
      if (fazenda?.turma_id) {
        const turma = await this.contextoMercadoRepositorio.buscarTurma(
          fazenda.turma_id,
        );
        if (turma?.professor_id === usuario.id) {
          return ordem;
        }
      }
    }
    throw new ForbiddenException('Ordem não acessível.');
  }

  async vender(dto: CriarVendaDto, usuario: UsuarioMercado) {
    if (usuario.perfil !== 'aluno') {
      throw new ForbiddenException('Somente alunos podem vender.');
    }
    return bancoDeDados.transaction(async (transacaoBanco) => {
      const fazenda = await this.estoque.fazendaDoAluno(
        dto.fazenda_id,
        usuario,
        transacaoBanco,
      );
      const produto = await this.produtoAtivo(dto.produto_id, transacaoBanco);
      await this.estoque.ajustar(
        fazenda.id,
        produto.chave_estoque,
        -dto.quantidade,
        transacaoBanco,
      );
      const ordem = await this.ordensRepositorio.criar(
        {
          tipo: 'VENDA',
          modalidade: 'AVULSA',
          status: 'ABERTA',
          produto_id: produto.id,
          usuario_id: usuario.id,
          fazenda_id: fazenda.id,
          temporada: fazenda.temporada_atual,
          quantidade: dto.quantidade,
        },
        transacaoBanco,
      );
      return ordem;
    });
  }

  async cancelar(id: string, usuario: UsuarioMercado) {
    return bancoDeDados.transaction(async (transacaoBanco) => {
      const ordem = await this.ordensRepositorio.buscarPorId(
        id,
        transacaoBanco,
        true,
      );
      if (!ordem) {
        throw new NotFoundException('Ordem não encontrada.');
      }
      if (ordem.modalidade !== 'AVULSA' || ordem.tipo !== 'VENDA') {
        throw new BadRequestException(
          'Use a rota de contribuições para alterar uma venda conjunta.',
        );
      }
      if (ordem.usuario_id !== usuario.id && usuario.perfil !== 'admin') {
        throw new ForbiddenException('A ordem não pertence ao usuário.');
      }
      if (ordem.status !== 'ABERTA' || !ordem.fazenda_id) {
        throw new ConflictException('A ordem não está aberta.');
      }
      const produto = await this.produto(ordem.produto_id, transacaoBanco);
      await this.estoque.ajustar(
        ordem.fazenda_id,
        produto.chave_estoque,
        Number(ordem.quantidade),
        transacaoBanco,
      );
      const cancelada = await this.ordensRepositorio.atualizar(
        id,
        { status: 'CANCELADA' },
        transacaoBanco,
      );
      return cancelada;
    });
  }

  async comprar(dto: ComprarDto, usuario: UsuarioMercado) {
    if (usuario.perfil !== 'comprador') {
      throw new ForbiddenException('Somente compradores podem comprar.');
    }
    const resultado = await bancoDeDados.transaction(async (transacaoBanco) => {
      let produtoId: string;
      let turmaId: string;
      let temporada: number;
      let quantidade: number;
      let fazendaId: string | null = null;
      let vendedorId: string | null = null;
      let grupoId: string | null = null;
      let ordemOrigemId: string | null = null;

      if (dto.origem === 'ORDEM') {
        const ordem = await this.ordensRepositorio.buscarPorId(
          dto.origem_id,
          transacaoBanco,
          true,
        );
        if (!ordem || ordem.tipo !== 'VENDA' || ordem.modalidade !== 'AVULSA') {
          throw new NotFoundException('Oferta avulsa não encontrada.');
        }
        if (ordem.status !== 'ABERTA' || !ordem.fazenda_id) {
          throw new ConflictException('A oferta não está aberta.');
        }
        const fazenda = await this.contextoMercadoRepositorio.buscarFazenda(
          ordem.fazenda_id,
          transacaoBanco,
        );
        if (!fazenda?.turma_id) {
          throw new BadRequestException(
            'A fazenda não está vinculada a uma turma.',
          );
        }
        produtoId = ordem.produto_id;
        turmaId = fazenda.turma_id;
        temporada = fazenda.temporada_atual;
        quantidade = Number(ordem.quantidade);
        fazendaId = fazenda.id;
        vendedorId = ordem.usuario_id;
        ordemOrigemId = ordem.id;
      } else {
        const grupo = await this.cooperativaRepositorio.buscarPorId(
          dto.origem_id,
          transacaoBanco,
          true,
        );
        if (!grupo) {
          throw new NotFoundException('Venda conjunta não encontrada.');
        }
        if (grupo.status !== 'ABERTA') {
          throw new ConflictException('A venda conjunta não está aberta.');
        }
        const contribuicoes = await this.ordensRepositorio.listarContribuicoes(
          grupo.id,
          'ABERTA',
          transacaoBanco,
        );
        if (new Set(contribuicoes.map((item) => item.fazenda_id)).size < 2) {
          throw new BadRequestException(
            'A venda conjunta exige duas fazendas distintas.',
          );
        }
        const fazenda = await this.contextoMercadoRepositorio.buscarFazenda(
          contribuicoes[0].fazenda_id as string,
          transacaoBanco,
        );
        if (!fazenda?.turma_id) {
          throw new BadRequestException('Fazenda sem turma.');
        }
        produtoId = grupo.produto_id;
        turmaId = grupo.turma_id;
        temporada = fazenda.temporada_atual;
        quantidade = contribuicoes.reduce(
          (soma, item) => soma + Number(item.quantidade),
          0,
        );
        grupoId = grupo.id;
      }

      const cotacao = await this.cotacoes.obter(
        produtoId,
        turmaId,
        temporada,
        transacaoBanco,
      );
      const preco = Number(cotacao.preco_atual);
      const valor = Math.round(quantidade * preco * 100) / 100;
      if (valor < 0.01) {
        throw new BadRequestException(
          'O valor da compra precisa ser de pelo menos um centavo.',
        );
      }
      const compra = await this.ordensRepositorio.criar(
        {
          tipo: 'COMPRA',
          modalidade: grupoId ? 'CONJUNTA' : 'AVULSA',
          status: 'EXECUTADA',
          produto_id: produtoId,
          usuario_id: usuario.id,
          fazenda_id: fazendaId,
          venda_conjunta_id: grupoId,
          ordem_origem_id: ordemOrigemId,
          temporada,
          quantidade,
          preco_unitario: preco,
          valor_total: valor,
        },
        transacaoBanco,
      );

      if (grupoId) {
        await this.ordensRepositorio.executarContribuicoes(
          grupoId,
          preco,
          transacaoBanco,
        );
        await this.cooperativaRepositorio.atualizar(
          grupoId,
          {
            status: 'AGUARDANDO_DISTRIBUICAO',
            valor_bruto: valor,
          },
          transacaoBanco,
        );
      } else {
        await this.ordensRepositorio.atualizar(
          ordemOrigemId as string,
          {
            status: 'EXECUTADA',
            preco_unitario: preco,
            valor_total: valor,
          },
          transacaoBanco,
        );
      }

      await this.transacoesRepositorio.criar(
        {
          tipo: grupoId ? 'COMPRA_CONJUNTA' : 'COMPRA_AVULSA',
          ordem_id: compra.id,
          venda_conjunta_id: grupoId,
          comprador_usuario_id: usuario.id,
          beneficiario_usuario_id: vendedorId,
          fazenda_id: fazendaId,
          valor,
        },
        transacaoBanco,
      );
      await this.cotacoes.registrarVenda(cotacao, quantidade, transacaoBanco);
      return compra;
    });
    await this.cotacoes.invalidar(resultado.produto_id);
    return resultado;
  }

  private async produto(
    id: string,
    transacaoBanco: import('knex').Knex.Transaction,
    ativo = false,
  ) {
    const produto = await this.produtosRepositorio.buscarPorId(
      id,
      transacaoBanco,
      ativo,
    );
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }

  private produtoAtivo(
    id: string,
    transacaoBanco: import('knex').Knex.Transaction,
  ) {
    return this.produto(id, transacaoBanco, true);
  }

  private verificarPerfilConsulta(usuario: UsuarioMercado): void {
    if (
      !['admin', 'professor', 'aluno', 'comprador'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso ao mercado.');
    }
  }
}
