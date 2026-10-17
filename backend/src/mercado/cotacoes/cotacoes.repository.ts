import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { Cotacao } from './entities/cotacao.entity';
import { paginar } from '../shared/paginar';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroCotacoesDto } from './dto/filtro-cotacoes.dto';

@Injectable()
export class CotacoesRepository {
  async findAll(filtro: FiltroCotacoesDto, usuario: UsuarioMercado) {
    const query = database<Cotacao>('cotacoes as c').select('c.*');
    if (usuario.perfil === 'aluno') {
      query.whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = c.turma_id')
          .where('f.usuario_id', usuario.id);
      });
    }
    if (usuario.perfil === 'professor') {
      query.whereExists(function () {
        this.select('t.id')
          .from('turmas as t')
          .whereRaw('t.id = c.turma_id')
          .where('t.professor_id', usuario.id);
      });
    }
    if (filtro.produto_id) {
      query.where('c.produto_id', filtro.produto_id);
    }
    if (filtro.turma_id) {
      query.where('c.turma_id', filtro.turma_id);
    }
    if (filtro.temporada) {
      query.where('c.temporada', filtro.temporada);
    }
    return paginar(
      query.orderBy('c.updated_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async ensure(
    produtoId: string,
    turmaId: string,
    temporada: number,
    preco: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('cotacoes')
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

  async findForUpdate(
    produtoId: string,
    turmaId: string,
    temporada: number,
    trx: Knex.Transaction,
  ): Promise<Cotacao | undefined> {
    return trx<Cotacao>('cotacoes')
      .where({ produto_id: produtoId, turma_id: turmaId, temporada })
      .forUpdate()
      .first();
  }

  async findCurrentForProduct(
    produtoId: string,
    trx: Knex.Transaction,
  ): Promise<Cotacao[]> {
    return trx<Cotacao>('cotacoes')
      .where({ produto_id: produtoId })
      .whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = cotacoes.turma_id')
          .whereRaw('f.temporada_atual = cotacoes.temporada');
      });
  }

  async updatePrice(
    id: string,
    preco: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('cotacoes')
      .where({ id })
      .update({ preco_atual: preco, updated_at: trx.fn.now() });
  }

  async recordSale(
    id: string,
    quantidadeVendida: number,
    preco: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('cotacoes').where({ id }).update({
      quantidade_vendida: quantidadeVendida,
      preco_atual: preco,
      updated_at: trx.fn.now(),
    });
  }
}
