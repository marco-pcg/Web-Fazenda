import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { Especie } from './especie.types';
import { QueryEspecieDto } from './dto/query-especie.dto';
import { paginar } from '../common/paginacao';

@Injectable()
export class EspeciesRepository {
  private readonly table = 'especies';

  async listar(filtros: QueryEspecieDto, page?: number, limit?: number) {
    const query = knex<Especie>(this.table).select('*').orderBy('nome', 'asc');

    if (filtros.nome) {
      query.where('nome', 'ilike', `%${filtros.nome}%`);
    }

    if (filtros.produto) {
      query.where('produto', 'ilike', `%${filtros.produto}%`);
    }

    if (filtros.search) {
      query.where((busca) => {
        busca
          .where('nome', 'ilike', `%${filtros.search}%`)
          .orWhere('produto', 'ilike', `%${filtros.search}%`);
      });
    }

    return paginar<Especie>(query, page, limit);
  }

  async findByNome(nome: string): Promise<Especie | undefined> {
    const especie = await knex<Especie>(this.table).where({ nome }).first();
    return especie;
  }

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
