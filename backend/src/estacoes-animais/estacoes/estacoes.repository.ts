import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { Estacao } from './estacao.types';
import { QueryEstacaoDto } from './dto/query-estacao.dto';
import { paginar } from '../common/paginacao';
import { NomeEstacao } from '../../common/enums/enums';

@Injectable()
export class EstacoesRepository {
  private readonly table = 'estacoes';

  async listar(filtros: QueryEstacaoDto, page?: number, limit?: number) {
    const query = knex<Estacao>(this.table).select('*').orderBy('ordem', 'asc');

    if (filtros.nome) {
      query.where('nome', filtros.nome);
    }

    if (filtros.ordem) {
      query.where('ordem', filtros.ordem);
    }

    if (filtros.search) {
      query.where('nome', 'ilike', `%${filtros.search}%`);
    }

    return paginar<Estacao>(query, page, limit);
  }

  async findByNome(nome: NomeEstacao): Promise<Estacao | undefined> {
    const estacao = await knex<Estacao>(this.table).where({ nome }).first();
    return estacao;
  }

  async findByOrdem(ordem: number): Promise<Estacao | undefined> {
    const estacao = await knex<Estacao>(this.table).where({ ordem }).first();
    return estacao;
  }

  async findById(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<Estacao | undefined> {
    const db = trx || knex;
    const estacao = await db<Estacao>(this.table).where({ id }).first();
    return estacao;
  }

  async insert(
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao> {
    const db = trx || knex;
    const [estacao] = await db<Estacao>(this.table)
      .insert(dados)
      .returning('*');
    return estacao;
  }

  async update(
    id: string,
    dados: Partial<Estacao>,
    trx?: Knex.Transaction,
  ): Promise<Estacao | undefined> {
    const db = trx || knex;
    const [estacao] = await db<Estacao>(this.table)
      .where({ id })
      .update(dados)
      .returning('*');
    return estacao;
  }
}
