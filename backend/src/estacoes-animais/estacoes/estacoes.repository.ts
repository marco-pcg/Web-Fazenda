import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { Estacao } from './estacao.types';

@Injectable()
export class EstacoesRepository {
  private readonly table = 'estacoes';

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Estacao | undefined> {
    const db = trx || knex;
    const estacao = await db<Estacao>(this.table).where({ id }).first();
    return estacao;
  }

  async insert(
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao> {
    const db = trx || knex;
    const [estacao] = await db<Estacao>(this.table)
      .insert(dados)
      .returning('*');
    return estacao;
  }

  async update(
    id: string,
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao | undefined> {
    const db = trx || knex;
    const [estacao] = await db<Estacao>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return estacao;
  }
}
