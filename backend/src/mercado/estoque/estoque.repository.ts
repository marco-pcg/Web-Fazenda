import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { paginar } from '../shared/paginar';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';
import { Estoque } from './entities/estoque.entity';

@Injectable()
export class EstoqueRepositorio {
  async garantir(
    fazendaId: string,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('estoques')
      .insert({ fazenda_id: fazendaId, racao: 0, produtos: {} })
      .onConflict('fazenda_id')
      .ignore();
  }

  async buscarParaAtualizar(
    fazendaId: string,
    transacaoBanco: Knex.Transaction,
  ): Promise<Estoque | undefined> {
    return transacaoBanco<Estoque>('estoques')
      .where({ fazenda_id: fazendaId })
      .forUpdate()
      .first();
  }

  async atualizarProdutos(
    fazendaId: string,
    produtos: Record<string, number>,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('estoques')
      .where({ fazenda_id: fazendaId })
      .update({
        produtos: JSON.stringify(produtos),
        updated_at: transacaoBanco.fn.now(),
      });
  }

  async listar(filtro: FiltroEstoqueDto, usuario: UsuarioMercado) {
    const consulta = bancoDeDados('estoques as e')
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
      consulta.where('f.usuario_id', usuario.id);
    }
    if (usuario.perfil === 'professor') {
      consulta
        .join('turmas as t', 't.id', 'f.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.fazenda_id) {
      consulta.where('e.fazenda_id', filtro.fazenda_id);
    }
    if (filtro.turma_id) {
      consulta.where('f.turma_id', filtro.turma_id);
    }
    if (filtro.produto_id) {
      consulta.where('p.id', filtro.produto_id);
    }
    return paginar(consulta.orderBy('e.fazenda_id'), filtro.page, filtro.limit);
  }
}
