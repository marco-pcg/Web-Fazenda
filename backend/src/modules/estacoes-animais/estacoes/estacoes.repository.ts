import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Estacao } from './estacao.types.js';

@Injectable()
export class EstacoesRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Estacao> {
    const db = trx || this.knex;
    return db('estacoes').where({ id }).first();
  }

  async insert(
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao> {
    const db = trx || this.knex;
    const [estacao] = await db('estacoes').insert(dados).returning('*');
    return estacao;
  }

  async update(
    id: string,
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao> {
    const db = trx || this.knex;
    const [estacao] = await db('estacoes')
      .where({ id })
      .update(dados)
      .returning('*');
    return estacao;
  }
}
