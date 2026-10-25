import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Colheita } from './entities/colheita.entity';
import { FiltroColheitaDto } from './dto/filtro-colheita.dto';

@Injectable()
export class ColheitasRepository {
  private readonly table = 'colheitas';
  private readonly colunas = [
    'colheitas.*',
    'culturas.nome as culturaNome',
    'talhoes.codigo as talhaoCodigo',
    'talhoes.fazendaId',
    'plantios.temporada',
    'plantios.quantidade as quantidadePlantada',
  ];

  async create(dados: any, trx: Knex = database): Promise<Colheita> {
    const [nova] = await trx(this.table).insert(dados).returning('*');
    return nova;
  }

  async findAll(filtro: FiltroColheitaDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro)
      .select(this.colunas)
      .orderBy('colheitas.created_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count(
      'colheitas.id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string) {
    return this.consultaComJoins()
      .select(this.colunas)
      .where('colheitas.id', id)
      .first();
  }

  private consultaFiltrada(filtro: FiltroColheitaDto) {
    const query = this.consultaComJoins();

    if (filtro.fazendaId) {
      query.where('talhoes.fazendaId', filtro.fazendaId);
    }
    if (filtro.culturaId) {
      query.where('plantios.culturaId', filtro.culturaId);
    }
    if (filtro.temporada) {
      query.where('plantios.temporada', filtro.temporada);
    }
    if (filtro.antecipada) {
      query.where('colheitas.antecipada', filtro.antecipada === 'true');
    }
    if (filtro.search) {
      query.where('culturas.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }

  private consultaComJoins() {
    return database(this.table)
      .join('plantios', 'plantios.id', 'colheitas.plantioId')
      .join('talhoes', 'talhoes.id', 'plantios.talhaoId')
      .join('culturas', 'culturas.id', 'plantios.culturaId');
  }
}
