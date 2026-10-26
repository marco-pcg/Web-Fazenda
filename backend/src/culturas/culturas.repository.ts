import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../db/knex-connection';
import { Cultura } from './entities/cultura.entity';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';
import { FiltroCulturaDto } from './dto/filtro-cultura.dto';

@Injectable()
export class CulturasRepository {
  private readonly table = 'culturas';

  async create(dados: CreateCulturaDto): Promise<Cultura> {
    return database.transaction(async (trx) => {
      const [nova] = await trx(this.table)
        .insert({
          nome: dados.nome,
          areaPorUnidade: dados.areaPorUnidade,
          aguaPorUnidade: dados.aguaPorUnidade,
          diasCrescimento: dados.diasCrescimento,
          rendimentoPorUnidade: dados.rendimentoPorUnidade,
          valorPorUnidade: dados.valorPorUnidade,
        })
        .returning('*');

      await this.salvarEstacoes(nova.id, dados.estacoes, trx);
      nova.estacoes = this.semRepetidas(dados.estacoes);
      return nova;
    });
  }

  async findAll(filtro: FiltroCulturaDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const culturas = await this.consultaFiltrada(filtro)
      .select('culturas.*')
      .orderBy('culturas.nome')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count(
      'culturas.id as count',
    );

    const dados: Cultura[] = [];
    for (const cultura of culturas) {
      dados.push(await this.comEstacoes(cultura));
    }

    return { dados, total: Number(total.count), pagina, limite };
  }

  async findOne(id: string): Promise<Cultura | undefined> {
    const cultura = await database(this.table).where({ id }).first();
    if (!cultura) {
      return undefined;
    }
    return this.comEstacoes(cultura);
  }

  findByNome(nome: string): Promise<Cultura | undefined> {
    return database(this.table).where('nome', 'ilike', nome).first();
  }

  async update(id: string, dados: UpdateCulturaDto) {
    await database.transaction(async (trx) => {
      await trx(this.table).where({ id }).update({
        nome: dados.nome,
        areaPorUnidade: dados.areaPorUnidade,
        aguaPorUnidade: dados.aguaPorUnidade,
        diasCrescimento: dados.diasCrescimento,
        rendimentoPorUnidade: dados.rendimentoPorUnidade,
        valorPorUnidade: dados.valorPorUnidade,
        updated_at: database.fn.now(),
      });

      if (dados.estacoes) {
        await trx('culturas_estacoes').where({ culturaId: id }).del();
        await this.salvarEstacoes(id, dados.estacoes, trx);
      }
    });
  }

  remove(id: string) {
    return database(this.table).where({ id }).del();
  }

  foiPlantada(id: string) {
    return database('plantios').where({ culturaId: id }).first();
  }

  private consultaFiltrada(filtro: FiltroCulturaDto) {
    const query = database(this.table);

    if (filtro.search) {
      query.where('culturas.nome', 'ilike', `%${filtro.search}%`);
    }
    if (filtro.estacao) {
      query
        .join('culturas_estacoes', 'culturas_estacoes.culturaId', 'culturas.id')
        .where('culturas_estacoes.estacao', filtro.estacao);
    }
    if (filtro.diasMaximo) {
      query.where('culturas.diasCrescimento', '<=', filtro.diasMaximo);
    }

    return query;
  }

  private async comEstacoes(cultura: Cultura) {
    const linhas = await database('culturas_estacoes')
      .where({ culturaId: cultura.id })
      .select('estacao');

    cultura.estacoes = linhas.map((linha) => linha.estacao);
    return cultura;
  }

  private async salvarEstacoes(
    culturaId: string,
    estacoes: string[],
    trx: Knex,
  ) {
    for (const estacao of this.semRepetidas(estacoes)) {
      await trx('culturas_estacoes').insert({ culturaId, estacao });
    }
  }

  private semRepetidas(estacoes: string[]) {
    const unicas: string[] = [];
    for (const estacao of estacoes) {
      if (!unicas.includes(estacao)) {
        unicas.push(estacao);
      }
    }
    return unicas;
  }
}
