import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Especie } from './especie.types.js';

@Injectable()
export class EspeciesRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Especie> {
    const db = trx || this.knex;
    return db('especies').where({ id }).first();
  }

  async insert(
    dados: Partial<Especie>,
    trx?: Knex.Transaction,
  ): Promise<Especie> {
    const db = trx || this.knex;
    const [especie] = await db('especies').insert(dados).returning('*');
    return especie;
  }

  async update(
    id: string,
    dados: Partial<Especie>,
    trx?: Knex.Transaction,
  ): Promise<Especie> {
    const db = trx || this.knex;
    const [especie] = await db('especies')
      .where({ id })
      .update(dados)
      .returning('*');
    return especie;
  }
}
