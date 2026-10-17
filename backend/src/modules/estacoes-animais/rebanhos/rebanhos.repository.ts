import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Rebanho } from './rebanho.types';

@Injectable()
export class RebanhosRepository {
  private readonly table = 'rebanhos';

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
