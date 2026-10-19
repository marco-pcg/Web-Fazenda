import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { VendaConjunta } from '../cooperativa/entities/venda-conjunta.entity';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroVendasConjuntasDto } from './dto/filtro-vendas-conjuntas.dto';

@Injectable()
export class CooperativaRepositorio {
  async listar(filtro: FiltroVendasConjuntasDto, usuario: UsuarioMercado) {
    const consulta = bancoDeDados<VendaConjunta>(
      'vendas_conjuntas as vc',
    ).select('vc.*');
    if (usuario.perfil === 'aluno') {
      consulta.whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = vc.turma_id')
          .where('f.usuario_id', usuario.id);
      });
    }
    if (usuario.perfil === 'professor') {
      consulta
        .join('turmas as t', 't.id', 'vc.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.produto_id) {
      consulta.where('vc.produto_id', filtro.produto_id);
    }
    if (filtro.status) {
      consulta.where('vc.status', filtro.status);
    }
    if (filtro.turma_id) {
      consulta.where('vc.turma_id', filtro.turma_id);
    }
    if (filtro.temporada) {
      consulta.where('vc.temporada', filtro.temporada);
    }
    return paginar(
      consulta.orderBy('vc.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async buscarPorId(
    id: string,
    transacaoBanco: Knex = bancoDeDados,
    bloqueio = false,
  ): Promise<VendaConjunta | undefined> {
    const consulta = transacaoBanco<VendaConjunta>('vendas_conjuntas').where({
      id,
    });
    if (bloqueio) {
      consulta.forUpdate();
    }
    return consulta.first();
  }

  async criar(
    dados: Partial<VendaConjunta>,
    transacaoBanco: Knex.Transaction,
  ): Promise<VendaConjunta> {
    const [grupo] = await transacaoBanco<VendaConjunta>('vendas_conjuntas')
      .insert(dados)
      .returning('*');
    return grupo;
  }

  async atualizar(
    id: string,
    dados: Partial<VendaConjunta> & { taxa?: number; valor_liquido?: number },
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('vendas_conjuntas')
      .where({ id })
      .update({ ...dados, updated_at: transacaoBanco.fn.now() });
  }
}
