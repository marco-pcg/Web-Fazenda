import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Plantio } from '../plantios/entities/plantio.entity';
import { Fazenda } from './entities/fazenda.entity';
import { Talhao } from '../talhoes/entities/talhao.entity';
import { FiltroFazendaDto } from './dto/filtro-fazenda.dto';

@Injectable()
export class FazendasRepository {
  async create(fazenda: Partial<Fazenda>): Promise<Fazenda> {
    const [nova] = await database<Fazenda>('fazendas')
      .insert(fazenda)
      .returning('*');
    return nova;
  }

  async findAll(filtro: FiltroFazendaDto, limit: number, offset: number) {
    const query = database<Fazenda>('fazendas');

    if (filtro.nome) {
      query.whereILike('nome', `%${filtro.nome}%`);
    }
    if (filtro.turma_id) {
      query.where('turma_id', filtro.turma_id);
    }
    if (filtro.estacao) {
      query.where('estacao_atual', filtro.estacao);
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

  async findOne(id: string): Promise<Fazenda | undefined> {
    return database<Fazenda>('fazendas').where({ id }).first();
  }

  async update(
    id: string,
    dados: Partial<Fazenda>,
    trx: Knex = database,
  ): Promise<Fazenda> {
    const [atualizada] = await trx<Fazenda>('fazendas')
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizada;
  }

  async remove(id: string) {
    return database<Fazenda>('fazendas').where({ id }).del();
  }

  async findTalhoes(id: string): Promise<Talhao[]> {
    return database<Talhao>('talhoes')
      .where({ fazenda_id: id })
      .orderBy('codigo');
  }

  async findTurma(id: string) {
    return database<{ id: string }>('turmas').where({ id }).first();
  }

  async findUsuario(id: string) {
    return database<{ id: string }>('usuarios').where({ id }).first();
  }

  async temPlantio(id: string) {
    return database<Plantio>('plantios')
      .join('talhoes', 'talhoes.id', 'plantios.talhao_id')
      .where('talhoes.fazenda_id', id)
      .first<Plantio | undefined>();
  }
}
