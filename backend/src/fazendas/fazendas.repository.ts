import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Fazenda } from './entities/fazenda.entity';
import { Talhao } from '../talhoes/entities/talhao.entity';
import { FiltroFazendaDto } from './dto/filtro-fazenda.dto';

@Injectable()
export class FazendasRepository {
  private readonly table = 'fazendas';

  async create(dados: any): Promise<Fazenda> {
    const [nova] = await database(this.table).insert(dados).returning('*');
    return nova;
  }

  async findAll(filtro: FiltroFazendaDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro)
      .select('*')
      .orderBy('nome')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count('id as count');

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string): Promise<Fazenda | undefined> {
    return database(this.table).where({ id }).first();
  }

  async update(id: string, dados: any, trx: Knex = database): Promise<Fazenda> {
    const [atualizada] = await trx(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizada;
  }

  remove(id: string) {
    return database(this.table).where({ id }).del();
  }

  findTalhoes(id: string): Promise<Talhao[]> {
    return database('talhoes').where({ fazendaId: id }).orderBy('codigo');
  }

  findTurma(id: string) {
    return database('turmas').where({ id }).first();
  }

  findUsuario(id: string) {
    return database('usuarios').where({ id }).first();
  }

  temPlantio(id: string) {
    return database('plantios')
      .join('talhoes', 'talhoes.id', 'plantios.talhaoId')
      .where('talhoes.fazendaId', id)
      .first();
  }

  private consultaFiltrada(filtro: FiltroFazendaDto) {
    const query = database(this.table);

    if (filtro.search) {
      query.where('nome', 'ilike', `%${filtro.search}%`);
    }
    if (filtro.turmaId) {
      query.where('turmaId', filtro.turmaId);
    }
    if (filtro.estacao) {
      query.where('estacaoAtual', filtro.estacao);
    }
    return query;
  }
}
