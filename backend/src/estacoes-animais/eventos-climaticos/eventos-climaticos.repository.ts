import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { EventoClimatico } from './evento-climatico.types';

@Injectable()
export class EventosClimaticosRepository {
  private readonly table = 'eventos_climaticos';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico | undefined> {
    const db = trx || knex;
    const evento = await db<EventoClimatico>(this.table).where({ id }).first();
    return evento;
  }

  async insert(
    dados: Partial<EventoClimatico>,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico> {
    const db = trx || knex;
    const [evento] = await db<EventoClimatico>(this.table)
      .insert(dados)
      .returning('*');
    return evento;
  }

  async update(
    id: string,
    dados: Partial<EventoClimatico>,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico | undefined> {
    const db = trx || knex;
    const [evento] = await db<EventoClimatico>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return evento;
  }
}
