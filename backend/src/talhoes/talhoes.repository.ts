import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Talhao } from './entities/talhao.entity';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { FiltroTalhaoDto } from './dto/filtro-talhao.dto';

@Injectable()
export class TalhoesRepository {
  private readonly table = 'talhoes';

  async create(dados: CreateTalhaoDto): Promise<Talhao> {
    const [novo] = await database(this.table).insert(dados).returning('*');
    return novo;
  }

  async findAll(filtro: FiltroTalhaoDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro)
      .select('*')
      .orderBy('codigo')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count('id as count');

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string): Promise<Talhao | undefined> {
    return database(this.table).where({ id }).first();
  }

  findByCodigo(fazendaId: string, codigo: string): Promise<Talhao | undefined> {
    return database(this.table).where({ fazendaId, codigo }).first();
  }

  async update(id: string, dados: any, trx: Knex = database): Promise<Talhao> {
    const [atualizado] = await trx(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizado;
  }

  remove(id: string) {
    return database(this.table).where({ id }).del();
  }

  temPlantio(id: string) {
    return database('plantios').where({ talhaoId: id }).first();
  }

  private consultaFiltrada(filtro: FiltroTalhaoDto) {
    const query = database(this.table);

    if (filtro.fazendaId) {
      query.where('fazendaId', filtro.fazendaId);
    }
    if (filtro.status) {
      query.where('status', filtro.status);
    }
    if (filtro.search) {
      query.where('codigo', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }
}
