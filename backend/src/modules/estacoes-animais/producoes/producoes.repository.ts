import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../../db/knex-connection';
import { Producao } from './producao.types';

@Injectable()
export class ProducoesRepository {
  private readonly table = 'producoes';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Producao | undefined> {
    const db = trx || knex;
    const producao = await db<Producao>(this.table).where({ id }).first();
    return producao;
  }

  async insert(
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao> {
    const db = trx || knex;
    const [producao] = await db<Producao>(this.table)
      .insert(dados)
      .returning('*');
    return producao;
  }

  async update(
    id: string,
    dados: Partial<Producao>,
    trx?: Knex.Transaction,
  ): Promise<Producao | undefined> {
    const db = trx || knex;
    const [producao] = await db<Producao>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return producao;
  }
}
