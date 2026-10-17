import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Temporada } from './temporada.types';

@Injectable()
export class TemporadasRepository {
  private readonly table = 'temporadas';

  async findById(id: string, trx?: Knex.Transaction): Promise<Temporada> {
    const db = trx || knex;
    return db(this.table).where({ id }).first();
  }

  async insert(
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const db = trx || knex;
    const [temporada] = await db(this.table).insert(dados).returning('*');
    return temporada;
  }

  async update(
    id: string,
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const db = trx || knex;
    const [temporada] = await db(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return temporada;
  }
}
