import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Colheita } from './entities/colheita.entity';
import { FiltroColheitaDto } from './dto/filtro-colheita.dto';

@Injectable()
export class ColheitasRepository {
  async create(
    colheita: Partial<Colheita>,
    trx: Knex = database,
  ): Promise<Colheita> {
    const [nova] = await trx<Colheita>('colheitas')
      .insert(colheita)
      .returning('*');
    return nova;
  }

  async findAll(filtro: FiltroColheitaDto, limit: number, offset: number) {
    const query = this.consultaComNomes();

    if (filtro.fazenda_id) {
      query.where('talhoes.fazenda_id', filtro.fazenda_id);
    }
    if (filtro.cultura_id) {
      query.where('plantios.cultura_id', filtro.cultura_id);
    }
    if (filtro.temporada) {
      query.where('plantios.temporada', filtro.temporada);
    }
    if (filtro.antecipada !== undefined) {
      query.where('colheitas.antecipada', filtro.antecipada === 'true');
    }
    if (filtro.search) {
      query.whereILike('culturas.nome', `%${filtro.search}%`);
    }

    const [{ total }] = await query
      .clone()
      .clearSelect()
      .count('colheitas.id as total');
    const dados = await query
      .orderBy('colheitas.id', 'desc')
      .limit(limit)
      .offset(offset);

    return { dados, total: Number(total) };
  }

  async findOne(id: number): Promise<Colheita | undefined> {
    return this.consultaComNomes()
      .where('colheitas.id', id)
      .first<Colheita | undefined>();
  }

  private consultaComNomes() {
    return database<Colheita>('colheitas')
      .join('plantios', 'plantios.id', 'colheitas.plantio_id')
      .join('talhoes', 'talhoes.id', 'plantios.talhao_id')
      .join('culturas', 'culturas.id', 'plantios.cultura_id')
      .select(
        'colheitas.*',
        'culturas.nome as cultura_nome',
        'talhoes.codigo as talhao_codigo',
        'talhoes.fazenda_id',
        'plantios.temporada',
        'plantios.quantidade as quantidade_plantada',
      );
  }
}
