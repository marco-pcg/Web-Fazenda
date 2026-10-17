import { database } from '../../db/knex-connection';
import { CotacoesRepository } from './cotacoes.repository';
import { ProdutosRepository } from '../produtos/produtos.repository';
import { ContextoMercadoRepository } from '../shared/contexto-mercado.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Knex } from 'knex';
import { UsuarioMercado } from '../shared/mercado.types';
import { Produto } from '../produtos/entities/produto.entity';
import { CotacaoAtualDto } from './dto/cotacao-atual.dto';
import { FiltroCotacoesDto } from './dto/filtro-cotacoes.dto';
import { Cotacao } from './entities/cotacao.entity';

@Injectable()
export class CotacoesService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(
    private readonly cotacoesRepository: CotacoesRepository,
    private readonly produtosRepository: ProdutosRepository,
    private readonly contextoMercadoRepository: ContextoMercadoRepository,
  ) {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        connectTimeout: 1000,
        reconnectStrategy: false,
      },
    });
    this.client.on('error', () => undefined);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
    } catch {
      return;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  preco(produto: Produto, quantidadeVendida: number): number {
    const bruto =
      Number(produto.preco_base) /
      (1 + Number(produto.sensibilidade) * quantidadeVendida);
    return Math.max(0.01, Math.round(bruto * 100) / 100);
  }

  async listar(filtro: FiltroCotacoesDto, usuario: UsuarioMercado) {
    if (
      !['admin', 'comprador', 'aluno', 'professor'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso às cotações.');
    }
    return this.cotacoesRepository.findAll(filtro, usuario);
  }

  async atual(query: CotacaoAtualDto, usuario: UsuarioMercado) {
    const fazenda = await this.contextoMercadoRepository.findFazenda(
      query.fazenda_id,
    );
    if (!fazenda || !fazenda.turma_id) {
      throw new NotFoundException('Fazenda vinculada a turma não encontrada.');
    }
    if (usuario.perfil === 'aluno' && fazenda.usuario_id !== usuario.id) {
      throw new ForbiddenException('A fazenda não pertence ao aluno.');
    }
    if (usuario.perfil === 'professor') {
      const turma = await this.contextoMercadoRepository.findTurma(
        fazenda.turma_id,
      );
      if (turma?.professor_id !== usuario.id) {
        throw new ForbiddenException('A turma não pertence ao professor.');
      }
    }
    if (
      !['admin', 'comprador', 'aluno', 'professor'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso às cotações.');
    }

    const chave = `mercado:cotacao:${query.produto_id}:${fazenda.turma_id}:${fazenda.temporada_atual}`;
    if (this.client.isReady) {
      try {
        const cached = await this.client.get(chave);
        if (cached) {
          return JSON.parse(cached) as Cotacao;
        }
      } catch {
        await this.client.disconnect();
      }
    }

    const cotacao = await database.transaction(async (trx) => {
      return this.obter(
        query.produto_id,
        fazenda.turma_id as string,
        fazenda.temporada_atual,
        trx,
      );
    });
    if (this.client.isReady) {
      try {
        await this.client.set(chave, JSON.stringify(cotacao), { EX: 60 });
      } catch {
        await this.client.disconnect();
      }
    }
    return cotacao;
  }

  async obter(
    produtoId: string,
    turmaId: string,
    temporada: number,
    trx: Knex.Transaction,
  ) {
    const produto = await this.produtosRepository.findOne(
      produtoId,
      trx,
      true,
      'share',
    );
    if (!produto) {
      throw new NotFoundException('Produto ativo não encontrado.');
    }

    await this.cotacoesRepository.ensure(
      produtoId,
      turmaId,
      temporada,
      this.preco(produto, 0),
      trx,
    );

    const cotacao = await this.cotacoesRepository.findForUpdate(
      produtoId,
      turmaId,
      temporada,
      trx,
    );
    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada.');
    }

    const precoAtual = this.preco(produto, Number(cotacao.quantidade_vendida));
    if (Number(cotacao.preco_atual) !== precoAtual) {
      await this.cotacoesRepository.updatePrice(cotacao.id, precoAtual, trx);
      cotacao.preco_atual = precoAtual;
    }
    return cotacao;
  }

  async registrarVenda(
    cotacao: Cotacao,
    quantidade: number,
    trx: Knex.Transaction,
  ) {
    const produto = await this.produtosRepository.findOne(
      cotacao.produto_id,
      trx,
    );
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    const quantidadeVendida = Number(cotacao.quantidade_vendida) + quantidade;
    await this.cotacoesRepository.recordSale(
      cotacao.id,
      quantidadeVendida,
      this.preco(produto, quantidadeVendida),
      trx,
    );
  }

  async recalcularProduto(
    produto: Produto,
    trx: Knex.Transaction,
  ): Promise<void> {
    const cotacoes = await this.cotacoesRepository.findCurrentForProduct(
      produto.id,
      trx,
    );
    for (const cotacao of cotacoes) {
      await this.cotacoesRepository.updatePrice(
        cotacao.id,
        this.preco(produto, Number(cotacao.quantidade_vendida)),
        trx,
      );
    }
  }

  async invalidar(produtoId: string): Promise<void> {
    if (!this.client.isReady) {
      return;
    }
    try {
      const chaves = await this.client.keys(`mercado:cotacao:${produtoId}:*`);
      if (chaves.length > 0) {
        await this.client.del(chaves);
      }
    } catch {
      await this.client.disconnect();
    }
  }
}
