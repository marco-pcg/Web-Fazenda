import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Especie } from './especie.types';

@Injectable()
export class EspeciesRepository {
  private readonly table = 'especies';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Especie | undefined> {
    const db = trx || knex;
    const especie = await db<Especie>(this.table).where({ id }).first();
    return especie;
  }

  async insert(
    dados: Partial<Especie>,
    trx?: Knex.Transaction,
  ): Promise<Especie> {
    const db = trx || knex;
    const [especie] = await db<Especie>(this.table)
      .insert(dados)
      .returning('*');
    return especie;
  }

  async update(
    id: string,
    dados: Partial<Especie>,
    trx?: Knex.Transaction,
  ): Promise<Especie | undefined> {
    const db = trx || knex;
    const [especie] = await db<Especie>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return especie;
  }
}
