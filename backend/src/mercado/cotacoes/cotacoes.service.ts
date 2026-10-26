import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Knex } from 'knex';
import { createClient } from 'redis';
import { database } from '../../db/knex-connection';
import { CotacoesRepositorio } from './cotacoes.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import { FazendaMercado, UsuarioLogado } from '../shared/mercado.types';
import { Produto } from '../produtos/entities/produto.entity';
import { Cotacao } from './entities/cotacao.entity';
import { CotacaoAtualDto } from './dto/cotacao-atual.dto';
import { FiltroCotacaoDto } from './dto/filtro-cotacao.dto';

@Injectable()
export class CotacoesServico implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CotacoesServico.name);
  private readonly redis = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      reconnectStrategy: false,
    },
  });

  constructor(
    private readonly cotacoesRepositorio: CotacoesRepositorio,
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly contextoRepositorio: ContextoMercadoRepositorio,
  ) {
    this.redis.on('error', () => {});
  }

  async onModuleInit() {
    try {
      await this.redis.connect();
    } catch {
      this.logger.warn('Redis indisponível, as cotações virão do banco.');
    }
  }

  async onModuleDestroy() {
    if (this.redis.isOpen) {
      await this.redis.close();
    }
  }

  findAll(filtro: FiltroCotacaoDto, usuario: UsuarioLogado) {
    return this.cotacoesRepositorio.findAll(filtro, usuario);
  }

  async atual(consulta: CotacaoAtualDto, usuario: UsuarioLogado) {
    const fazenda = await this.contextoRepositorio.buscarFazenda(
      consulta.fazendaId,
    );
    if (!fazenda || !fazenda.turmaId) {
      throw new NotFoundException('Fazenda não encontrada ou sem turma.');
    }
    await this.verificarAcesso(fazenda, usuario);

    const chave =
      'mercado:cotacao:' +
      consulta.produtoId +
      ':' +
      fazenda.turmaId +
      ':' +
      fazenda.temporadaAtual;

    const emCache = await this.lerCache(chave);
    if (emCache) {
      return emCache;
    }

    const cotacao = await database.transaction((trx) =>
      this.buscarParaVenda(
        consulta.produtoId,
        fazenda.turmaId as string,
        fazenda.temporadaAtual,
        trx,
      ),
    );

    await this.salvarCache(chave, cotacao);
    return cotacao;
  }

  async buscarParaVenda(
    produtoId: string,
    turmaId: string,
    temporada: number,
    trx: Knex.Transaction,
  ) {
    const produto = await this.produtosRepositorio.findOne(produtoId, trx);
    if (!produto || !produto.ativo) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    await this.cotacoesRepositorio.criarSeNaoExistir(
      produtoId,
      turmaId,
      temporada,
      this.preco(produto, 0),
      trx,
    );

    const cotacao = await this.cotacoesRepositorio.buscarParaAtualizar(
      produtoId,
      turmaId,
      temporada,
      trx,
    );
    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada.');
    }

    const precoAtual = this.preco(produto, Number(cotacao.quantidadeVendida));
    if (Number(cotacao.precoAtual) !== precoAtual) {
      await this.cotacoesRepositorio.atualizar(cotacao.id, { precoAtual }, trx);
    }

    return { ...cotacao, precoAtual, produto };
  }

  async registrarVenda(
    cotacao: Cotacao,
    produto: Produto,
    quantidade: number,
    trx: Knex.Transaction,
  ) {
    const quantidadeVendida = Number(cotacao.quantidadeVendida) + quantidade;
    await this.cotacoesRepositorio.atualizar(
      cotacao.id,
      { quantidadeVendida, precoAtual: this.preco(produto, quantidadeVendida) },
      trx,
    );
  }

  async limparCache(produtoId: string) {
    if (!this.redis.isReady) {
      return;
    }
    try {
      const chaves = await this.redis.keys(
        'mercado:cotacao:' + produtoId + ':*',
      );
      if (chaves.length > 0) {
        await this.redis.del(chaves);
      }
    } catch {
      this.logger.warn('Não foi possível limpar o cache das cotações.');
    }
  }

  private calcularPreco(
    precoBase: number,
    sensibilidade: number,
    quantidadeVendida: number,
  ) {
    const preco = precoBase / (1 + sensibilidade * quantidadeVendida);
    return Math.max(0.01, Number(preco.toFixed(2)));
  }

  private preco(produto: Produto, quantidadeVendida: number) {
    return this.calcularPreco(
      Number(produto.precoBase),
      Number(produto.sensibilidade),
      quantidadeVendida,
    );
  }

  private async verificarAcesso(
    fazenda: FazendaMercado,
    usuario: UsuarioLogado,
  ) {
    if (usuario.perfil === 'aluno' && fazenda.usuarioId !== usuario.id) {
      throw new ForbiddenException('Essa fazenda não é sua.');
    }
    if (usuario.perfil === 'professor') {
      const ehProfessor = await this.contextoRepositorio.professorDaTurma(
        fazenda.turmaId as string,
        usuario.id,
      );
      if (!ehProfessor) {
        throw new ForbiddenException('Essa turma não é sua.');
      }
    }
  }

  private async lerCache(chave: string) {
    if (!this.redis.isReady) {
      return null;
    }
    try {
      const valor = await this.redis.get(chave);
      return valor ? JSON.parse(valor) : null;
    } catch {
      return null;
    }
  }

  private async salvarCache(chave: string, cotacao: object) {
    if (!this.redis.isReady) {
      return;
    }
    try {
      await this.redis.set(chave, JSON.stringify(cotacao), { EX: 60 });
    } catch {
      this.logger.warn('Não foi possível salvar a cotação no cache.');
    }
  }
}
