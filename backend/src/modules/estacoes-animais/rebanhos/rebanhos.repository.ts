import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Rebanho } from './rebanho.types.js';

@Injectable()
export class RebanhosRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Rebanho> {
    const db = trx || this.knex;
    return db('rebanhos').where({ id }).first();
  }

  async insert(
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho> {
    const db = trx || this.knex;
    const [rebanho] = await db('rebanhos').insert(dados).returning('*');
    return rebanho;
  }

  async update(
    id: string,
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho> {
    const db = trx || this.knex;
    const [rebanho] = await db('rebanhos')
      .where({ id })
      .update(dados)
      .returning('*');
    return rebanho;
  }
}
