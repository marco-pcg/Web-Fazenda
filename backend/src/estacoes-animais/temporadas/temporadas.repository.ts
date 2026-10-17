import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { Temporada } from './temporada.types';

@Injectable()
export class TemporadasRepository {
  private readonly table = 'temporadas';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada | undefined> {
    const db = trx || knex;
    const temporada = await db<Temporada>(this.table).where({ id }).first();
    return temporada;
  }

  async insert(
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const db = trx || knex;
    const [temporada] = await db<Temporada>(this.table)
      .insert(dados)
      .returning('*');
    return temporada;
  }

  async update(
    id: string,
    dados: Partial<Temporada>,
    trx?: Knex.Transaction,
  ): Promise<Temporada | undefined> {
    const db = trx || knex;
    const [temporada] = await db<Temporada>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return temporada;
  }
}
