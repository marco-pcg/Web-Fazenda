import { Injectable } from '@nestjs/common';
import { database } from '../db/knex-connection';
import { Plantio } from '../plantios/entities/plantio.entity';
import { Cultura } from './entities/cultura.entity';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';
import { FiltroCulturaDto } from './dto/filtro-cultura.dto';

@Injectable()
export class CulturasRepository {
  async create(createCulturaDto: CreateCulturaDto): Promise<Cultura> {
    const [nova] = await database<Cultura>('culturas')
      .insert(createCulturaDto)
      .returning('*');
    return nova;
  }

  async findAll(filtro: FiltroCulturaDto, limit: number, offset: number) {
    const query = database<Cultura>('culturas');

    if (filtro.nome) {
      query.whereILike('nome', `%${filtro.nome}%`);
    }
    if (filtro.estacao) {
      query.whereRaw('? = ANY(estacoes)', [filtro.estacao]);
    }
    if (filtro.dias_maximo) {
      query.where('dias_crescimento', '<=', filtro.dias_maximo);
    }
    if (filtro.search) {
      query.whereILike('nome', `%${filtro.search}%`);
    }

    const [{ total }] = await query.clone().count({ total: 'id' });
    const dados = await query
      .select('*')
      .orderBy('id')
      .limit(limit)
      .offset(offset);

    return { dados, total: Number(total) };
  }

  async findOne(id: string): Promise<Cultura | undefined> {
    return database<Cultura>('culturas').where({ id }).first();
  }

  async findByNome(nome: string): Promise<Cultura | undefined> {
    return database<Cultura>('culturas').whereILike('nome', nome).first();
  }

  async update(
    id: string,
    updateCulturaDto: UpdateCulturaDto,
  ): Promise<Cultura> {
    const [atualizada] = await database<Cultura>('culturas')
      .where({ id })
      .update({ ...updateCulturaDto, updated_at: database.fn.now() })
      .returning('*');
    return atualizada;
  }

  async remove(id: string) {
    return database<Cultura>('culturas').where({ id }).del();
  }

  async foiPlantada(id: string) {
    return database<Plantio>('plantios').where({ cultura_id: id }).first();
  }
}
