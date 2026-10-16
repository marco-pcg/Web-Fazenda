import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Producao } from './producao.types.js';

@Injectable()
export class ProducoesRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Producao> {
    const db = trx || this.knex;
    return db('producoes').where({ id }).first();
  }

  async insert(
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao> {
    const db = trx || this.knex;
    const [producao] = await db('producoes').insert(dados).returning('*');
    return producao;
  }

  async update(
    id: string,
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao> {
    const db = trx || this.knex;
    const [producao] = await db('producoes')
      .where({ id })
      .update(dados)
      .returning('*');
    return producao;
  }
}
