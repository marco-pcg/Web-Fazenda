import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { Cotacao } from './entities/cotacao.entity';
import { paginar } from '../shared/paginar';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroCotacoesDto } from './dto/filtro-cotacoes.dto';

@Injectable()
export class CotacoesRepositorio {
  async listar(filtro: FiltroCotacoesDto, usuario: UsuarioMercado) {
    const consulta = bancoDeDados<Cotacao>('cotacoes as c').select('c.*');
    if (usuario.perfil === 'aluno') {
      consulta.whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = c.turma_id')
          .where('f.usuario_id', usuario.id);
      });
    }
    if (usuario.perfil === 'professor') {
      consulta.whereExists(function () {
        this.select('t.id')
          .from('turmas as t')
          .whereRaw('t.id = c.turma_id')
          .where('t.professor_id', usuario.id);
      });
    }
    if (filtro.produto_id) {
      consulta.where('c.produto_id', filtro.produto_id);
    }
    if (filtro.turma_id) {
      consulta.where('c.turma_id', filtro.turma_id);
    }
    if (filtro.temporada) {
      consulta.where('c.temporada', filtro.temporada);
    }
    return paginar(
      consulta.orderBy('c.updated_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async garantir(
    produtoId: string,
    turmaId: string,
    temporada: number,
    preco: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('cotacoes')
      .insert({
        produto_id: produtoId,
        turma_id: turmaId,
        temporada,
        quantidade_vendida: 0,
        preco_atual: preco,
      })
      .onConflict(['produto_id', 'turma_id', 'temporada'])
      .ignore();
  }

  async buscarParaAtualizar(
    produtoId: string,
    turmaId: string,
    temporada: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<Cotacao | undefined> {
    return transacaoBanco<Cotacao>('cotacoes')
      .where({ produto_id: produtoId, turma_id: turmaId, temporada })
      .forUpdate()
      .first();
  }

  async buscarAtuaisDoProduto(
    produtoId: string,
    transacaoBanco: Knex.Transaction,
  ): Promise<Cotacao[]> {
    return transacaoBanco<Cotacao>('cotacoes')
      .where({ produto_id: produtoId })
      .whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = cotacoes.turma_id')
          .whereRaw('f.temporada_atual = cotacoes.temporada');
      });
  }

  async atualizarPreco(
    id: string,
    preco: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('cotacoes')
      .where({ id })
      .update({ preco_atual: preco, updated_at: transacaoBanco.fn.now() });
  }

  async registrarVenda(
    id: string,
    quantidadeVendida: number,
    preco: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('cotacoes').where({ id }).update({
      quantidade_vendida: quantidadeVendida,
      preco_atual: preco,
      updated_at: transacaoBanco.fn.now(),
    });
  }
}
