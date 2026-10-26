import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { Temporada } from './temporada.types';
import { QueryTemporadaDto } from './dto/query-temporada.dto';
import { paginar } from '../common/paginacao';
import { StatusTemporada } from '../../common/enums/enums';

@Injectable()
export class TemporadasRepository {
  private readonly table = 'temporadas';

  async listar(filtros: QueryTemporadaDto, page?: number, limit?: number) {
    const query = knex<Temporada>(this.table)
      .select('*')
      .orderBy('numero', 'desc');

    if (filtros.turma_id) {
      query.where('turma_id', filtros.turma_id);
    }

    if (filtros.status) {
      query.where('status', filtros.status);
    }

    if (filtros.search) {
      query.where('nome', 'ilike', `%${filtros.search}%`);
    }

    return paginar<Temporada>(query, page, limit);
  }

  async proximoNumero(
    turma_id: string,
    trx?: Knex.Transaction,
  ): Promise<number> {
    const db = trx || knex;
    const resultado = (await db<Temporada>(this.table)
      .where({ turma_id })
      .max('numero as maior')
      .first()) as { maior: number | null } | undefined;
    return Number(resultado?.maior || 0) + 1;
  }

  async findAtivaDaTurma(
    turma_id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada | undefined> {
    const db = trx || knex;
    const temporada = await db<Temporada>(this.table)
      .where({ turma_id, status: StatusTemporada.ATIVA })
      .first();
    return temporada;
  }

  async findPlanejadaMaisAntiga(
    turma_id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada | undefined> {
    const db = trx || knex;
    const temporada = await db<Temporada>(this.table)
      .where({ turma_id, status: StatusTemporada.PLANEJADA })
      .orderBy('numero', 'asc')
      .first();
    return temporada;
  }

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
