import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Alimentacao } from './alimentacao.types';

@Injectable()
export class AlimentacoesRepository {
  private readonly table = 'alimentacoes';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Alimentacao | undefined> {
    const db = trx || knex;
    const alimentacao = await db<Alimentacao>(this.table).where({ id }).first();
    return alimentacao;
  }

  async insert(
    dados: Partial<Alimentacao>,
    trx?: Knex.Transaction,
  ): Promise<Alimentacao> {
    const db = trx || knex;
    const [alimentacao] = await db<Alimentacao>(this.table)
      .insert(dados)
      .returning('*');
    return alimentacao;
  }

  async update(
    id: string,
    dados: Partial<Alimentacao>,
    trx?: Knex.Transaction,
  ): Promise<Alimentacao | undefined> {
    const db = trx || knex;
    const [alimentacao] = await db<Alimentacao>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return alimentacao;
  }
}
