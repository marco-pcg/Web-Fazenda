import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Plantio } from './entities/plantio.entity';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';

@Injectable()
export class PlantiosRepository {
  private readonly table = 'plantios';
  private readonly colunas = [
    'plantios.*',
    'talhoes.codigo as talhaoCodigo',
    'talhoes.fazendaId',
    'culturas.nome as culturaNome',
  ];

  async create(dados: any, trx: Knex = database): Promise<Plantio> {
    const [novo] = await trx(this.table).insert(dados).returning('*');
    return novo;
  }

  async findAll(filtro: FiltroPlantioDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro)
      .select(this.colunas)
      .orderBy('plantios.created_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count(
      'plantios.id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string): Promise<Plantio | undefined> {
    return this.consultaComJoins()
      .select(this.colunas)
      .where('plantios.id', id)
      .first();
  }

  plantioNaTemporada(talhaoId: string, culturaId: string, temporada: number) {
    return database(this.table)
      .where({ talhaoId, culturaId, temporada })
      .first();
  }

  marcarColhido(id: string, trx: Knex) {
    return trx(this.table)
      .where({ id })
      .where('status', '<>', 'colhido')
      .update({ status: 'colhido', updated_at: database.fn.now() });
  }

  marcarProntos(data: string) {
    return database(this.table)
      .where('status', 'em_crescimento')
      .where('dataPrevistaColheita', '<=', data)
      .update({ status: 'pronto', updated_at: database.fn.now() });
  }

  private consultaFiltrada(filtro: FiltroPlantioDto) {
    const query = this.consultaComJoins();

    if (filtro.fazendaId) {
      query.where('talhoes.fazendaId', filtro.fazendaId);
    }
    if (filtro.culturaId) {
      query.where('plantios.culturaId', filtro.culturaId);
    }
    if (filtro.status) {
      query.where('plantios.status', filtro.status);
    }
    if (filtro.temporada) {
      query.where('plantios.temporada', filtro.temporada);
    }
    if (filtro.search) {
      query.where('culturas.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }

  private consultaComJoins() {
    return database(this.table)
      .join('talhoes', 'talhoes.id', 'plantios.talhaoId')
      .join('culturas', 'culturas.id', 'plantios.culturaId');
  }
}
