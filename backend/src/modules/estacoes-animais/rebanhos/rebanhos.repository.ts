import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Rebanho } from './rebanho.types';

@Injectable()
export class RebanhosRepository {
  private readonly table = 'rebanhos';

  async findById(id: string, trx?: Knex.Transaction): Promise<Rebanho> {
    const db = trx || knex;
    return db(this.table).where({ id }).first();
  }

  async insert(
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho> {
    const db = trx || knex;
    const [rebanho] = await db(this.table).insert(dados).returning('*');
    return rebanho;
  }

  async update(
    id: string,
    dados: Partial<Rebanho>,
    trx?: Knex.Transaction,
  ): Promise<Rebanho> {
    const db = trx || knex;
    const [rebanho] = await db(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return rebanho;
  }
}
