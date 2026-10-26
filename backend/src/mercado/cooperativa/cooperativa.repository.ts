import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { UsuarioLogado } from '../shared/mercado.types';
import { VendaConjunta } from './entities/venda-conjunta.entity';
import { FiltroVendaConjuntaDto } from './dto/filtro-venda-conjunta.dto';

@Injectable()
export class CooperativaRepositorio {
  private readonly table = 'vendas_conjuntas';

  async create(
    dados: Partial<VendaConjunta>,
    trx: Knex.Transaction,
  ): Promise<VendaConjunta> {
    const [nova] = await trx(this.table).insert(dados).returning('*');
    return nova;
  }

  async findAll(filtro: FiltroVendaConjuntaDto, usuario: UsuarioLogado) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro, usuario)
      .select('vendas_conjuntas.*', 'produtos.nome as produtoNome')
      .orderBy('vendas_conjuntas.created_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro, usuario).count(
      'vendas_conjuntas.id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string): Promise<VendaConjunta | undefined> {
    return database(this.table).where({ id }).first();
  }

  buscarParaAtualizar(
    id: string,
    trx: Knex.Transaction,
  ): Promise<VendaConjunta | undefined> {
    return trx(this.table).where({ id }).forUpdate().first();
  }

  async update(
    id: string,
    dados: Partial<VendaConjunta>,
    trx: Knex.Transaction,
  ) {
    await trx(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() });
  }

  private consultaFiltrada(
    filtro: FiltroVendaConjuntaDto,
    usuario: UsuarioLogado,
  ) {
    const query = database(this.table).join(
      'produtos',
      'produtos.id',
      'vendas_conjuntas.produtoId',
    );

    if (usuario.perfil === 'aluno') {
      query.whereIn(
        'vendas_conjuntas.turmaId',
        database('fazendas').select('turmaId').where('usuarioId', usuario.id),
      );
    }
    if (usuario.perfil === 'professor') {
      query.whereIn(
        'vendas_conjuntas.turmaId',
        database('turmas').select('id').where('professorId', usuario.id),
      );
    }
    if (filtro.status) {
      query.where('vendas_conjuntas.status', filtro.status);
    }
    if (filtro.produtoId) {
      query.where('vendas_conjuntas.produtoId', filtro.produtoId);
    }
    if (filtro.turmaId) {
      query.where('vendas_conjuntas.turmaId', filtro.turmaId);
    }
    if (filtro.temporada) {
      query.where('vendas_conjuntas.temporada', filtro.temporada);
    }
    if (filtro.search) {
      query.where('produtos.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }
}
