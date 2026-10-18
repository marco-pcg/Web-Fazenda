import { database } from '../../db/knex-connection';
import { CooperativaRepository } from './cooperativa.repository';
import { OrdensRepository } from '../ordens/ordens.repository';
import { ProdutosRepository } from '../produtos/produtos.repository';
import { TransacoesRepository } from '../transacoes/transacoes.repository';
import { ContextoMercadoRepository } from '../shared/contexto-mercado.repository';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { EstoqueService } from '../estoque/estoque.service';
import { FazendaMercado, UsuarioMercado } from '../shared/mercado.types';
import { Ordem } from '../ordens/entities/ordem.entity';
import { VendaConjunta } from './entities/venda-conjunta.entity';
import { AlterarContribuicaoDto } from './dto/alterar-contribuicao.dto';
import { ContribuirDto } from './dto/contribuir.dto';
import { FiltroVendasConjuntasDto } from './dto/filtro-vendas-conjuntas.dto';
import { CriarVendaDto } from '../ordens/dto/criar-venda.dto';
import { FiltroTransacoesDto } from '../transacoes/dto/filtro-transacoes.dto';
import { calcularDistribuicao } from './distribuicao';

@Injectable()
export class CooperativaService {
  constructor(
    private readonly cooperativaRepository: CooperativaRepository,
    private readonly ordensRepository: OrdensRepository,
    private readonly produtosRepository: ProdutosRepository,
    private readonly transacoesRepository: TransacoesRepository,
    private readonly contextoMercadoRepository: ContextoMercadoRepository,
    private readonly estoque: EstoqueService,
  ) {}

  async listar(filtro: FiltroVendasConjuntasDto, usuario: UsuarioMercado) {
    this.verificarPerfilConsulta(usuario);
    return this.cooperativaRepository.findAll(filtro, usuario);
  }

  async detalhe(id: string, usuario: UsuarioMercado) {
    const grupo = await this.cooperativaRepository.findOne(id);
    if (!grupo) {
      throw new NotFoundException('Venda conjunta não encontrada.');
    }
    await this.verificarAcesso(grupo, usuario);
    const contribuicoes =
      await this.ordensRepository.findActiveContributions(id);
    return {
      ...grupo,
      contribuicoes,
      quantidade: contribuicoes.reduce(
        (soma, ordem) => soma + Number(ordem.quantidade),
        0,
      ),
      compravel:
        grupo.status === 'ABERTA' &&
        new Set(contribuicoes.map((ordem) => ordem.fazenda_id)).size >= 2,
    };
  }

  async criar(dto: CriarVendaDto, usuario: UsuarioMercado) {
    this.exigirAluno(usuario);
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
      const grupo = await this.cooperativaRepository.create(
        {
          produto_id: produto.id,
          turma_id: fazenda.turma_id as string,
          criador_usuario_id: usuario.id,
          temporada: fazenda.temporada_atual,
          status: 'ABERTA',
        },
        trx,
      );
      await this.ordensRepository.create(
        {
          tipo: 'VENDA',
          modalidade: 'CONJUNTA',
          status: 'ABERTA',
          produto_id: produto.id,
          usuario_id: usuario.id,
          fazenda_id: fazenda.id,
          venda_conjunta_id: grupo.id,
          temporada: fazenda.temporada_atual,
          quantidade: dto.quantidade,
        },
        trx,
      );
      return grupo;
    });
  }

  async contribuir(id: string, dto: ContribuirDto, usuario: UsuarioMercado) {
    this.exigirAluno(usuario);
    return database.transaction(async (trx) => {
      const grupo = await this.grupoAberto(id, trx);
      const fazenda = await this.estoque.fazendaDoAluno(
        dto.fazenda_id,
        usuario,
        trx,
      );
      this.verificarMesmaTurmaTemporada(grupo, fazenda);
      const existente = await this.ordensRepository.findOpenContribution(
        id,
        fazenda.id,
        trx,
      );
      if (existente) {
        throw new ConflictException(
          'A fazenda já contribuiu. Altere a contribuição existente.',
        );
      }
      const produto = await this.produtoAtivo(grupo.produto_id, trx);
      await this.estoque.ajustar(
        fazenda.id,
        produto.chave_estoque,
        -dto.quantidade,
        trx,
      );
      const contribuicao = await this.ordensRepository.create(
        {
          tipo: 'VENDA',
          modalidade: 'CONJUNTA',
          status: 'ABERTA',
          produto_id: grupo.produto_id,
          usuario_id: usuario.id,
          fazenda_id: fazenda.id,
          venda_conjunta_id: id,
          temporada: fazenda.temporada_atual,
          quantidade: dto.quantidade,
        },
        trx,
      );
      return contribuicao;
    });
  }

  async alterar(
    id: string,
    ordemId: string,
    dto: AlterarContribuicaoDto,
    usuario: UsuarioMercado,
  ) {
    this.exigirAluno(usuario);
    return database.transaction(async (trx) => {
      const grupo = await this.grupoAberto(id, trx);
      const ordem = await this.contribuicaoAberta(id, ordemId, usuario, trx);
      const produto = await this.produto(grupo.produto_id, trx);
      await this.estoque.ajustar(
        ordem.fazenda_id as string,
        produto.chave_estoque,
        Number(ordem.quantidade) - dto.quantidade,
        trx,
      );
      const atualizada = await this.ordensRepository.update(
        ordemId,
        { quantidade: dto.quantidade },
        trx,
      );
      return atualizada;
    });
  }

  async retirar(id: string, ordemId: string, usuario: UsuarioMercado) {
    this.exigirAluno(usuario);
    return database.transaction(async (trx) => {
      const grupo = await this.grupoAberto(id, trx);
      const ordem = await this.contribuicaoAberta(id, ordemId, usuario, trx);
      const produto = await this.produto(grupo.produto_id, trx);
      await this.estoque.ajustar(
        ordem.fazenda_id as string,
        produto.chave_estoque,
        Number(ordem.quantidade),
        trx,
      );
      await this.ordensRepository.update(ordemId, { status: 'CANCELADA' }, trx);
      const restantes = await this.ordensRepository.findContributions(
        id,
        'ABERTA',
        trx,
      );
      if (restantes.length === 0) {
        await this.cooperativaRepository.update(
          id,
          { status: 'CANCELADA' },
          trx,
        );
      }
      return { status: restantes.length === 0 ? 'CANCELADA' : 'ABERTA' };
    });
  }

  async distribuir(id: string, usuario: UsuarioMercado) {
    return database.transaction(async (trx) => {
      const grupo = await this.cooperativaRepository.findOne(id, trx, true);
      if (!grupo) {
        throw new NotFoundException('Venda conjunta não encontrada.');
      }
      if (
        usuario.perfil !== 'admin' &&
        grupo.criador_usuario_id !== usuario.id
      ) {
        throw new ForbiddenException(
          'Somente o criador ou admin pode distribuir.',
        );
      }
      if (
        grupo.status !== 'AGUARDANDO_DISTRIBUICAO' ||
        grupo.valor_bruto === null
      ) {
        throw new ConflictException(
          'A venda não está aguardando distribuição.',
        );
      }
      const contribuicoes = await this.ordensRepository.findContributions(
        id,
        'EXECUTADA',
        trx,
      );
      if (contribuicoes.length === 0) {
        throw new BadRequestException('A venda não possui contribuições.');
      }
      const calculo = calcularDistribuicao(
        Number(grupo.valor_bruto),
        contribuicoes.map((ordem) => ({
          id: ordem.id,
          quantidade: Number(ordem.quantidade),
        })),
      );

      for (const parcela of calculo.parcelas) {
        const ordem = contribuicoes.find(
          (item) => item.id === parcela.id,
        ) as Ordem;
        await this.transacoesRepository.create(
          {
            tipo: 'REPASSE',
            ordem_id: ordem.id,
            venda_conjunta_id: id,
            beneficiario_usuario_id: ordem.usuario_id,
            fazenda_id: ordem.fazenda_id,
            valor: parcela.centavos / 100,
          },
          trx,
        );
      }
      await this.transacoesRepository.create(
        {
          tipo: 'TAXA',
          venda_conjunta_id: id,
          valor: calculo.taxaCentavos / 100,
        },
        trx,
      );
      await this.cooperativaRepository.update(
        id,
        {
          status: 'DISTRIBUIDA',
          taxa: calculo.taxaCentavos / 100,
          valor_liquido: calculo.liquidoCentavos / 100,
        },
        trx,
      );
      return {
        venda_conjunta_id: id,
        valor_bruto: calculo.brutoCentavos / 100,
        taxa: calculo.taxaCentavos / 100,
        valor_liquido: calculo.liquidoCentavos / 100,
        repasses: calculo.parcelas.map((item) => {
          const ordem = contribuicoes.find(
            (contribuicao) => contribuicao.id === item.id,
          ) as Ordem;
          return {
            fazenda_id: ordem.fazenda_id,
            usuario_id: ordem.usuario_id,
            valor: item.centavos / 100,
          };
        }),
      };
    });
  }

  async extrato(filtro: FiltroTransacoesDto, usuario: UsuarioMercado) {
    this.verificarPerfilConsulta(usuario);
    return this.transacoesRepository.findAll(filtro, usuario, true);
  }

  private async grupoAberto(id: string, trx: Knex.Transaction) {
    const grupo = await this.cooperativaRepository.findOne(id, trx, true);
    if (!grupo) {
      throw new NotFoundException('Venda conjunta não encontrada.');
    }
    if (grupo.status !== 'ABERTA') {
      throw new ConflictException('A venda conjunta não está aberta.');
    }
    return grupo;
  }

  private async contribuicaoAberta(
    id: string,
    ordemId: string,
    usuario: UsuarioMercado,
    trx: Knex.Transaction,
  ) {
    const ordem = await this.ordensRepository.findContribution(
      ordemId,
      id,
      trx,
      true,
    );
    if (!ordem) {
      throw new NotFoundException('Contribuição não encontrada.');
    }
    if (ordem.usuario_id !== usuario.id) {
      throw new ForbiddenException('A contribuição não pertence ao aluno.');
    }
    if (ordem.status !== 'ABERTA') {
      throw new ConflictException('A contribuição não está aberta.');
    }
    return ordem;
  }

  private async produto(id: string, trx: Knex.Transaction, ativo = false) {
    const produto = await this.produtosRepository.findOne(id, trx, ativo);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }

  private produtoAtivo(id: string, trx: Knex.Transaction) {
    return this.produto(id, trx, true);
  }

  private verificarMesmaTurmaTemporada(
    grupo: VendaConjunta,
    fazenda: FazendaMercado,
  ): void {
    if (
      fazenda.turma_id !== grupo.turma_id ||
      fazenda.temporada_atual !== grupo.temporada
    ) {
      throw new BadRequestException(
        'A fazenda precisa pertencer à turma e temporada da venda conjunta.',
      );
    }
  }

  private exigirAluno(usuario: UsuarioMercado): void {
    if (usuario.perfil !== 'aluno') {
      throw new ForbiddenException('Somente alunos podem contribuir.');
    }
  }

  private verificarPerfilConsulta(usuario: UsuarioMercado): void {
    if (
      !['admin', 'professor', 'aluno', 'comprador'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso à cooperativa.');
    }
  }

  private async verificarAcesso(
    grupo: VendaConjunta,
    usuario: UsuarioMercado,
  ): Promise<void> {
    if (usuario.perfil === 'admin' || usuario.perfil === 'comprador') {
      return;
    }
    if (usuario.perfil === 'professor') {
      const turma = await this.contextoMercadoRepository.findTurma(
        grupo.turma_id,
      );
      if (turma?.professor_id === usuario.id) {
        return;
      }
    }
    if (usuario.perfil === 'aluno') {
      const fazenda = await this.contextoMercadoRepository.findFazendaDoUsuario(
        grupo.turma_id,
        usuario.id,
      );
      if (fazenda) {
        return;
      }
    }
    throw new ForbiddenException('Venda conjunta não acessível.');
  }
}
