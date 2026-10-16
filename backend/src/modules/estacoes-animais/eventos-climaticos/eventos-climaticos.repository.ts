import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { EventoClimatico } from './evento-climatico.types.js';

@Injectable()
export class EventosClimaticosRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<EventoClimatico> {
    const db = trx || this.knex;
    return db('eventos_climaticos').where({ id }).first();
  }

  async insert(
    dados: Partial<EventoClimatico>,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico> {
    const db = trx || this.knex;
    const [evento] = await db('eventos_climaticos')
      .insert(dados)
      .returning('*');
    return evento;
  }

  async update(
    id: string,
    dados: Partial<EventoClimatico>,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico> {
    const db = trx || this.knex;
    const [evento] = await db('eventos_climaticos')
      .where({ id })
      .update(dados)
      .returning('*');
    return evento;
  }
}
