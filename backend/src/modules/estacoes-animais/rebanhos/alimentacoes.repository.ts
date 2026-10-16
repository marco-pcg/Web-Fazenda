import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../database/database.constants.js';
import { Alimentacao } from './alimentacao.types.js';

@Injectable()
export class AlimentacoesRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<Alimentacao> {
    const db = trx || this.knex;
    return db('alimentacoes').where({ id }).first();
  }

  async insert(
    dados: Partial<Alimentacao>,
    trx?: Knex.Transaction,
  ): Promise<Alimentacao> {
    const db = trx || this.knex;
    const [alimentacao] = await db('alimentacoes').insert(dados).returning('*');
    return alimentacao;
  }

  async update(
    id: string,
    dados: Partial<Alimentacao>,
    trx?: Knex.Transaction,
  ): Promise<Alimentacao> {
    const db = trx || this.knex;
    const [alimentacao] = await db('alimentacoes')
      .where({ id })
      .update(dados)
      .returning('*');
    return alimentacao;
  }
}
