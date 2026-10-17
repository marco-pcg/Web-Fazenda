import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Plantio } from './entities/plantio.entity';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';

@Injectable()
export class PlantiosRepository {
  async create(
    plantio: Partial<Plantio>,
    trx: Knex = database,
  ): Promise<Plantio> {
    const [novo] = await trx<Plantio>('plantios')
      .insert(plantio)
      .returning('*');
    return novo;
  }

  async findAll(filtro: FiltroPlantioDto, limit: number, offset: number) {
    const query = this.consultaComNomes();

    if (filtro.fazenda_id) {
      query.where('talhoes.fazenda_id', filtro.fazenda_id);
    }
    if (filtro.cultura_id) {
      query.where('plantios.cultura_id', filtro.cultura_id);
    }
    if (filtro.status) {
      query.where('plantios.status', filtro.status);
    }
    if (filtro.temporada) {
      query.where('plantios.temporada', filtro.temporada);
    }
    if (filtro.search) {
      query.whereILike('culturas.nome', `%${filtro.search}%`);
    }

    const [{ total }] = await query
      .clone()
      .clearSelect()
      .count('plantios.id as total');
    const dados = await query
      .orderBy('plantios.id', 'desc')
      .limit(limit)
      .offset(offset);

    return { dados, total: Number(total) };
  }

  async findOne(id: string): Promise<Plantio | undefined> {
    return this.consultaComNomes()
      .where('plantios.id', id)
      .first<Plantio | undefined>();
  }

  async findPlantioAnterior(
    talhao_id: string,
    cultura_id: string,
    temporada: number,
  ) {
    return database<Plantio>('plantios')
      .where({ talhao_id, cultura_id, temporada })
      .first();
  }

  async update(
    id: string,
    dados: Partial<Plantio>,
    trx: Knex = database,
  ): Promise<Plantio> {
    const [atualizado] = await trx<Plantio>('plantios')
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizado;
  }

  async marcarProntos(data: string) {
    return database<Plantio>('plantios')
      .where('status', 'em_crescimento')
      .where('data_prevista_colheita', '<=', data)
      .update({ status: 'pronto', updated_at: database.fn.now() });
  }

  private consultaComNomes() {
    return database<Plantio>('plantios')
      .join('talhoes', 'talhoes.id', 'plantios.talhao_id')
      .join('culturas', 'culturas.id', 'plantios.cultura_id')
      .select(
        'plantios.*',
        'talhoes.codigo as talhao_codigo',
        'talhoes.fazenda_id',
        'culturas.nome as cultura_nome',
      );
  }
}
