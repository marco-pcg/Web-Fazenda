import { database } from '../../db/knex-connection';
import { OrdensRepository } from './ordens.repository';
import { ProdutosRepository } from '../produtos/produtos.repository';
import { CooperativaRepository } from '../cooperativa/cooperativa.repository';
import { TransacoesRepository } from '../transacoes/transacoes.repository';
import { ContextoMercadoRepository } from '../shared/contexto-mercado.repository';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstoqueService } from '../estoque/estoque.service';
import { CotacoesService } from '../cotacoes/cotacoes.service';
import { UsuarioMercado } from '../shared/mercado.types';
import { ComprarDto } from './dto/comprar.dto';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { FiltroOrdensDto } from './dto/filtro-ordens.dto';

@Injectable()
export class OrdensService {
  constructor(
    private readonly ordensRepository: OrdensRepository,
    private readonly produtosRepository: ProdutosRepository,
    private readonly cooperativaRepository: CooperativaRepository,
    private readonly transacoesRepository: TransacoesRepository,
    private readonly contextoMercadoRepository: ContextoMercadoRepository,
    private readonly estoque: EstoqueService,
    private readonly cotacoes: CotacoesService,
  ) {}

  async listar(filtro: FiltroOrdensDto, usuario: UsuarioMercado) {
    this.verificarPerfilConsulta(usuario);
    return this.ordensRepository.findAll(filtro, usuario);
  }

  async detalhe(id: string, usuario: UsuarioMercado) {
    const ordem = await this.ordensRepository.findOne(id);
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
      const fazenda = await this.contextoMercadoRepository.findFazenda(
        ordem.fazenda_id,
      );
      if (fazenda?.turma_id) {
        const turma = await this.contextoMercadoRepository.findTurma(
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
    return database.transaction(async (trx) => {
      const fazenda = await this.estoque.fazendaDoAluno(
        dto.fazenda_id,
        usuario,
        trx,
      );
      const produto = await this.produtoAtivo(dto.produto_id, trx);
      await this.estoque.ajustar(
        fazenda.id,
        produto.chave_estoque,
        -dto.quantidade,
        trx,
      );
      const ordem = await this.ordensRepository.create(
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
        trx,
      );
      return ordem;
    });
  }

  async cancelar(id: string, usuario: UsuarioMercado) {
    return database.transaction(async (trx) => {
      const ordem = await this.ordensRepository.findOne(id, trx, true);
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
      const produto = await this.produto(ordem.produto_id, trx);
      await this.estoque.ajustar(
        ordem.fazenda_id,
        produto.chave_estoque,
        Number(ordem.quantidade),
        trx,
      );
      const cancelada = await this.ordensRepository.update(
        id,
        { status: 'CANCELADA' },
        trx,
      );
      return cancelada;
    });
  }

  async comprar(dto: ComprarDto, usuario: UsuarioMercado) {
    if (usuario.perfil !== 'comprador') {
      throw new ForbiddenException('Somente compradores podem comprar.');
    }
    const resultado = await database.transaction(async (trx) => {
      let produtoId: string;
      let turmaId: string;
      let temporada: number;
      let quantidade: number;
      let fazendaId: string | null = null;
      let vendedorId: string | null = null;
      let grupoId: string | null = null;
      let ordemOrigemId: string | null = null;

      if (dto.origem === 'ORDEM') {
        const ordem = await this.ordensRepository.findOne(
          dto.origem_id,
          trx,
          true,
        );
        if (!ordem || ordem.tipo !== 'VENDA' || ordem.modalidade !== 'AVULSA') {
          throw new NotFoundException('Oferta avulsa não encontrada.');
        }
        if (ordem.status !== 'ABERTA' || !ordem.fazenda_id) {
          throw new ConflictException('A oferta não está aberta.');
        }
        const fazenda = await this.contextoMercadoRepository.findFazenda(
          ordem.fazenda_id,
          trx,
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
        const grupo = await this.cooperativaRepository.findOne(
          dto.origem_id,
          trx,
          true,
        );
        if (!grupo) {
          throw new NotFoundException('Venda conjunta não encontrada.');
        }
        if (grupo.status !== 'ABERTA') {
          throw new ConflictException('A venda conjunta não está aberta.');
        }
        const contribuicoes = await this.ordensRepository.findContributions(
          grupo.id,
          'ABERTA',
          trx,
        );
        if (new Set(contribuicoes.map((item) => item.fazenda_id)).size < 2) {
          throw new BadRequestException(
            'A venda conjunta exige duas fazendas distintas.',
          );
        }
        const fazenda = await this.contextoMercadoRepository.findFazenda(
          contribuicoes[0].fazenda_id as string,
          trx,
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
        trx,
      );
      const preco = Number(cotacao.preco_atual);
      const valor = Math.round(quantidade * preco * 100) / 100;
      if (valor < 0.01) {
        throw new BadRequestException(
          'O valor da compra precisa ser de pelo menos um centavo.',
        );
      }
      const compra = await this.ordensRepository.create(
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
        trx,
      );

      if (grupoId) {
        await this.ordensRepository.executeContributions(grupoId, preco, trx);
        await this.cooperativaRepository.update(
          grupoId,
          {
            status: 'AGUARDANDO_DISTRIBUICAO',
            valor_bruto: valor,
          },
          trx,
        );
      } else {
        await this.ordensRepository.update(
          ordemOrigemId as string,
          {
            status: 'EXECUTADA',
            preco_unitario: preco,
            valor_total: valor,
          },
          trx,
        );
      }

      await this.transacoesRepository.create(
        {
          tipo: grupoId ? 'COMPRA_CONJUNTA' : 'COMPRA_AVULSA',
          ordem_id: compra.id,
          venda_conjunta_id: grupoId,
          comprador_usuario_id: usuario.id,
          beneficiario_usuario_id: vendedorId,
          fazenda_id: fazendaId,
          valor,
        },
        trx,
      );
      await this.cotacoes.registrarVenda(cotacao, quantidade, trx);
      return compra;
    });
    await this.cotacoes.invalidar(resultado.produto_id);
    return resultado;
  }

  private async produto(
    id: string,
    trx: import('knex').Knex.Transaction,
    ativo = false,
  ) {
    const produto = await this.produtosRepository.findOne(id, trx, ativo);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }

  private produtoAtivo(id: string, trx: import('knex').Knex.Transaction) {
    return this.produto(id, trx, true);
  }

  private verificarPerfilConsulta(usuario: UsuarioMercado): void {
    if (
      !['admin', 'professor', 'aluno', 'comprador'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso ao mercado.');
    }
  }
}
