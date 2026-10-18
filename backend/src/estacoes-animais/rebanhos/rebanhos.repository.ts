import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { FiltrosRebanho, Rebanho } from './rebanho.types';
import { paginar } from '../common/paginacao';

@Injectable()
export class RebanhosRepository {
  private readonly table = 'rebanhos';

  async listar(filtros: FiltrosRebanho, page?: number, limit?: number) {
    const query = knex<Rebanho>(this.table)
      .select('*')
      .orderBy('created_at', 'desc');

    if (filtros.especie_id) {
      query.where('especie_id', filtros.especie_id);
    }

    if (filtros.saude) {
      query.where('saude', filtros.saude);
    }

    if (filtros.fazenda_ids) {
      query.whereIn('fazenda_id', filtros.fazenda_ids);
    }

    if (filtros.search) {
      query.whereIn(
        'especie_id',
        knex('especies')
          .select('id')
          .where('nome', 'ilike', `%${filtros.search}%`),
      );
    }

    return paginar<Rebanho>(query, page, limit);
  }

  async findPorFazendaEEspecie(
    fazenda_id: string,
    especie_id: string,
    trx?: Knex.Transaction,
  ): Promise<Rebanho | undefined> {
    const db = trx || knex;
    const rebanho = await db<Rebanho>(this.table)
      .where({ fazenda_id, especie_id })
      .first();
    return rebanho;
  }

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Rebanho | undefined> {
    const db = trx || knex;
    const rebanho = await db<Rebanho>(this.table).where({ id }).first();
    return rebanho;
  }

  async insert(
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho> {
    const db = trx || knex;
    const [rebanho] = await db<Rebanho>(this.table)
      .insert(dados)
      .returning('*');
    return rebanho;
  }

  async update(
    id: string,
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho | undefined> {
    const db = trx || knex;
    const [rebanho] = await db<Rebanho>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return rebanho;
  }
}
