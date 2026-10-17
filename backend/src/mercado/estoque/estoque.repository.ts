import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { paginar } from '../shared/paginar';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';
import { Estoque } from './entities/estoque.entity';

@Injectable()
export class EstoqueRepository {
  async ensure(fazendaId: string, trx: Knex.Transaction): Promise<void> {
    await trx('estoques')
      .insert({ fazenda_id: fazendaId, racao: 0, produtos: {} })
      .onConflict('fazenda_id')
      .ignore();
  }

  async findForUpdate(
    fazendaId: string,
    trx: Knex.Transaction,
  ): Promise<Estoque | undefined> {
    return trx<Estoque>('estoques')
      .where({ fazenda_id: fazendaId })
      .forUpdate()
      .first();
  }

  async updateProducts(
    fazendaId: string,
    produtos: Record<string, number>,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('estoques')
      .where({ fazenda_id: fazendaId })
      .update({ produtos: JSON.stringify(produtos), updated_at: trx.fn.now() });
  }

  async findAll(filtro: FiltroEstoqueDto, usuario: UsuarioMercado) {
    const query = database('estoques as e')
      .join('fazendas as f', 'f.id', 'e.fazenda_id')
      .joinRaw(
        'LEFT JOIN LATERAL jsonb_each_text(e.produtos) AS item(chave, quantidade) ON true',
      )
      .leftJoin('produtos as p', 'p.chave_estoque', 'item.chave')
      .select(
        'e.fazenda_id',
        'e.racao',
        'p.id as produto_id',
        'p.nome as produto',
        'item.chave',
        'item.quantidade',
      );
    if (usuario.perfil === 'aluno') {
      query.where('f.usuario_id', usuario.id);
    }
    if (usuario.perfil === 'professor') {
      query
        .join('turmas as t', 't.id', 'f.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.fazenda_id) {
      query.where('e.fazenda_id', filtro.fazenda_id);
    }
    if (filtro.turma_id) {
      query.where('f.turma_id', filtro.turma_id);
    }
    if (filtro.produto_id) {
      query.where('p.id', filtro.produto_id);
    }
    return paginar(query.orderBy('e.fazenda_id'), filtro.page, filtro.limit);
  }
}
