import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { EventoClimatico } from './evento-climatico.types';
import { QueryEventoClimaticoDto } from './dto/query-evento-climatico.dto';
import { paginar } from '../common/paginacao';
import { StatusEvento } from '../../common/enums/enums';

@Injectable()
export class EventosClimaticosRepository {
  private readonly table = 'eventos_climaticos';

  async listar(
    filtros: QueryEventoClimaticoDto,
    page?: number,
    limit?: number,
  ) {
    const query = knex<EventoClimatico>(this.table)
      .select('*')
      .orderBy('created_at', 'desc');

    if (filtros.tipo) {
      query.where('tipo', filtros.tipo);
    }

    if (filtros.temporada_id) {
      query.where('temporada_id', filtros.temporada_id);
    }

    if (filtros.turma_id) {
      query.where('turma_id', filtros.turma_id);
    }

    if (filtros.status) {
      query.where('status', filtros.status);
    }

    if (filtros.search) {
      query.where('descricao', 'ilike', `%${filtros.search}%`);
    }

    return paginar<EventoClimatico>(query, page, limit);
  }

  async listarAtivosPorTurma(
    turma_id: string,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico[]> {
    const db = trx || knex;
    const eventos = await db<EventoClimatico>(this.table).where({
      turma_id,
      status: StatusEvento.ATIVO,
    });
    return eventos;
  }

  async listarAtivosPorTemporada(
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico[]> {
    const db = trx || knex;
    const eventos = await db<EventoClimatico>(this.table).where({
      temporada_id,
      status: StatusEvento.ATIVO,
    });
    return eventos;
  }

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
