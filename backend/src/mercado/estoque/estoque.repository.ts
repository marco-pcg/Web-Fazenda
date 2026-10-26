import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { UsuarioLogado } from '../shared/mercado.types';
import { Estoque } from './entities/estoque.entity';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';

@Injectable()
export class EstoqueRepositorio {
  private readonly table = 'estoques';

  async criarSeNaoExistir(fazendaId: string, trx: Knex.Transaction) {
    await trx(this.table)
      .insert({ fazendaId, racao: 0, produtos: {} })
      .onConflict('fazendaId')
      .ignore();
  }

  buscarParaAtualizar(
    fazendaId: string,
    trx: Knex.Transaction,
  ): Promise<Estoque | undefined> {
    return trx(this.table).where({ fazendaId }).forUpdate().first();
  }

  async salvarProdutos(
    fazendaId: string,
    produtos: Record<string, number>,
    trx: Knex.Transaction,
  ) {
    await trx(this.table)
      .where({ fazendaId })
      .update({
        produtos: JSON.stringify(produtos),
        updated_at: database.fn.now(),
      });
  }

  async findAll(filtro: FiltroEstoqueDto, usuario: UsuarioLogado) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro, usuario)
      .select(
        'estoques.fazendaId',
        'fazendas.nome as fazendaNome',
        'estoques.racao',
        'estoques.produtos',
      )
      .orderBy('fazendas.nome')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro, usuario).count(
      'estoques.fazendaId as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  private consultaFiltrada(filtro: FiltroEstoqueDto, usuario: UsuarioLogado) {
    const query = database(this.table).join(
      'fazendas',
      'fazendas.id',
      'estoques.fazendaId',
    );

    if (usuario.perfil === 'aluno') {
      query.where('fazendas.usuarioId', usuario.id);
    }
    if (usuario.perfil === 'professor') {
      query.whereIn(
        'fazendas.turmaId',
        database('turmas').select('id').where('professorId', usuario.id),
      );
    }
    if (filtro.fazendaId) {
      query.where('estoques.fazendaId', filtro.fazendaId);
    }
    if (filtro.turmaId) {
      query.where('fazendas.turmaId', filtro.turmaId);
    }
    if (filtro.search) {
      query.where('fazendas.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }
}
