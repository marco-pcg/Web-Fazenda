import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Temporada } from './temporada.types.js';

@Injectable()
export class TemporadasRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Temporada> {
    const db = trx || this.knex;
    return db('temporadas').where({ id }).first();
  }

  async insert(
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const db = trx || this.knex;
    const [temporada] = await db('temporadas').insert(dados).returning('*');
    return temporada;
  }

  async update(
    id: string,
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const db = trx || this.knex;
    const [temporada] = await db('temporadas')
      .where({ id })
      .update(dados)
      .returning('*');
    return temporada;
  }
}
