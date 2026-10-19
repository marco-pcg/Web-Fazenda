import { database as bancoDeDados } from '../../db/knex-connection';
import { CotacoesRepositorio } from './cotacoes.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
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
export class CotacoesServico implements OnModuleInit, OnModuleDestroy {
  private clienteRedis: RedisClientType;

  constructor(
    private readonly cotacoesRepositorio: CotacoesRepositorio,
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly contextoMercadoRepositorio: ContextoMercadoRepositorio,
  ) {
    this.clienteRedis = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        connectTimeout: 1000,
        reconnectStrategy: false,
      },
    });
    this.clienteRedis.on('error', () => undefined);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.clienteRedis.connect();
    } catch {
      return;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.clienteRedis.isOpen) {
      await this.clienteRedis.quit();
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
    return this.cotacoesRepositorio.listar(filtro, usuario);
  }

  async atual(consulta: CotacaoAtualDto, usuario: UsuarioMercado) {
    const fazenda = await this.contextoMercadoRepositorio.buscarFazenda(
      consulta.fazenda_id,
    );
    if (!fazenda || !fazenda.turma_id) {
      throw new NotFoundException('Fazenda vinculada a turma não encontrada.');
    }
    if (usuario.perfil === 'aluno' && fazenda.usuario_id !== usuario.id) {
      throw new ForbiddenException('A fazenda não pertence ao aluno.');
    }
    if (usuario.perfil === 'professor') {
      const turma = await this.contextoMercadoRepositorio.buscarTurma(
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

    const chave = `mercado:cotacao:${consulta.produto_id}:${fazenda.turma_id}:${fazenda.temporada_atual}`;
    if (this.clienteRedis.isReady) {
      try {
        const emCache = await this.clienteRedis.get(chave);
        if (emCache) {
          return JSON.parse(emCache) as Cotacao;
        }
      } catch {
        await this.clienteRedis.disconnect();
      }
    }

    const cotacao = await bancoDeDados.transaction(async (transacaoBanco) => {
      return this.obter(
        consulta.produto_id,
        fazenda.turma_id as string,
        fazenda.temporada_atual,
        transacaoBanco,
      );
    });
    if (this.clienteRedis.isReady) {
      try {
        await this.clienteRedis.set(chave, JSON.stringify(cotacao), { EX: 60 });
      } catch {
        await this.clienteRedis.disconnect();
      }
    }
    return cotacao;
  }

  async obter(
    produtoId: string,
    turmaId: string,
    temporada: number,
    transacaoBanco: Knex.Transaction,
  ) {
    const produto = await this.produtosRepositorio.buscarPorId(
      produtoId,
      transacaoBanco,
      true,
      'share',
    );
    if (!produto) {
      throw new NotFoundException('Produto ativo não encontrado.');
    }

    await this.cotacoesRepositorio.garantir(
      produtoId,
      turmaId,
      temporada,
      this.preco(produto, 0),
      transacaoBanco,
    );

    const cotacao = await this.cotacoesRepositorio.buscarParaAtualizar(
      produtoId,
      turmaId,
      temporada,
      transacaoBanco,
    );
    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada.');
    }

    const precoAtual = this.preco(produto, Number(cotacao.quantidade_vendida));
    if (Number(cotacao.preco_atual) !== precoAtual) {
      await this.cotacoesRepositorio.atualizarPreco(
        cotacao.id,
        precoAtual,
        transacaoBanco,
      );
      cotacao.preco_atual = precoAtual;
    }
    return cotacao;
  }

  async registrarVenda(
    cotacao: Cotacao,
    quantidade: number,
    transacaoBanco: Knex.Transaction,
  ) {
    const produto = await this.produtosRepositorio.buscarPorId(
      cotacao.produto_id,
      transacaoBanco,
    );
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    const quantidadeVendida = Number(cotacao.quantidade_vendida) + quantidade;
    await this.cotacoesRepositorio.registrarVenda(
      cotacao.id,
      quantidadeVendida,
      this.preco(produto, quantidadeVendida),
      transacaoBanco,
    );
  }

  async recalcularProduto(
    produto: Produto,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    const cotacoes = await this.cotacoesRepositorio.buscarAtuaisDoProduto(
      produto.id,
      transacaoBanco,
    );
    for (const cotacao of cotacoes) {
      await this.cotacoesRepositorio.atualizarPreco(
        cotacao.id,
        this.preco(produto, Number(cotacao.quantidade_vendida)),
        transacaoBanco,
      );
    }
  }

  async invalidar(produtoId: string): Promise<void> {
    if (!this.clienteRedis.isReady) {
      return;
    }
    try {
      const chaves = await this.clienteRedis.keys(
        `mercado:cotacao:${produtoId}:*`,
      );
      if (chaves.length > 0) {
        await this.clienteRedis.del(chaves);
      }
    } catch {
      await this.clienteRedis.disconnect();
    }
  }
}
