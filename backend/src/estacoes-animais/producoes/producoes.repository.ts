import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { FiltrosProducao, Producao } from './producao.types';
import { paginar } from '../common/paginacao';

@Injectable()
export class ProducoesRepository {
  private readonly table = 'producoes';

  async listar(filtros: FiltrosProducao, page?: number, limit?: number) {
    const query = knex<Producao>(this.table)
      .select('*')
      .orderBy('created_at', 'desc');

    if (filtros.produto) {
      query.where('produto', 'ilike', `%${filtros.produto}%`);
    }

    if (filtros.search) {
      query.where('produto', 'ilike', `%${filtros.search}%`);
    }

    if (filtros.rebanho_id) {
      query.where('rebanho_id', filtros.rebanho_id);
    }

    if (filtros.temporada_id) {
      query.where('temporada_id', filtros.temporada_id);
    }

    if (filtros.data_inicio) {
      query.where('created_at', '>=', new Date(filtros.data_inicio));
    }

    if (filtros.data_fim) {
      const diaSeguinte = new Date(filtros.data_fim);
      diaSeguinte.setUTCDate(diaSeguinte.getUTCDate() + 1);
      query.where('created_at', '<', diaSeguinte);
    }

    if (filtros.fazenda_ids) {
      query.whereIn(
        'rebanho_id',
        knex('rebanhos')
          .select('id')
          .whereIn('fazenda_id', filtros.fazenda_ids),
      );
    }

    return paginar<Producao>(query, page, limit);
  }

  async findDoRebanhoNaTemporada(
    rebanho_id: string,
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<Producao | undefined> {
    const db = trx || knex;
    const producao = await db<Producao>(this.table)
      .where({ rebanho_id, temporada_id })
      .first();
    return producao;
  }

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Producao | undefined> {
    const db = trx || knex;
    const producao = await db<Producao>(this.table).where({ id }).first();
    return producao;
  }

  async insert(
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao> {
    const db = trx || knex;
    const [producao] = await db<Producao>(this.table)
      .insert(dados)
      .returning('*');
    return producao;
  }

  async update(
    id: string,
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao | undefined> {
    const db = trx || knex;
    const [producao] = await db<Producao>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return producao;
  }
}
