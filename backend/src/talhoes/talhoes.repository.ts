import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Plantio } from '../plantios/entities/plantio.entity';
import { Talhao } from './entities/talhao.entity';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { FiltroTalhaoDto } from './dto/filtro-talhao.dto';

@Injectable()
export class TalhoesRepository {
  async create(createTalhaoDto: CreateTalhaoDto): Promise<Talhao> {
    const [novo] = await database<Talhao>('talhoes')
      .insert(createTalhaoDto)
      .returning('*');
    return novo;
  }

  async findAll(filtro: FiltroTalhaoDto, limit: number, offset: number) {
    const query = database<Talhao>('talhoes');

    if (filtro.fazenda_id) {
      query.where('fazenda_id', filtro.fazenda_id);
    }
    if (filtro.status) {
      query.where('status', filtro.status);
    }
    if (filtro.codigo) {
      query.whereILike('codigo', `${filtro.codigo}%`);
    }
    if (filtro.search) {
      query.whereILike('codigo', `%${filtro.search}%`);
    }

    const [{ total }] = await query.clone().count({ total: 'id' });
    const dados = await query
      .select('*')
      .orderBy(['fazenda_id', 'codigo'])
      .limit(limit)
      .offset(offset);

    return { dados, total: Number(total) };
  }

  async findOne(id: number): Promise<Talhao | undefined> {
    return database<Talhao>('talhoes').where({ id }).first();
  }

  async findByCodigo(
    fazenda_id: number,
    codigo: string,
  ): Promise<Talhao | undefined> {
    return database<Talhao>('talhoes').where({ fazenda_id, codigo }).first();
  }

  async update(
    id: number,
    dados: Partial<Talhao>,
    trx: Knex = database,
  ): Promise<Talhao> {
    const [atualizado] = await trx<Talhao>('talhoes')
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizado;
  }

  async remove(id: number) {
    return database<Talhao>('talhoes').where({ id }).del();
  }

  async temPlantio(id: number) {
    return database<Plantio>('plantios').where({ talhao_id: id }).first();
  }
}
