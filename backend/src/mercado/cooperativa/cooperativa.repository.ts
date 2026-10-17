import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { VendaConjunta } from '../cooperativa/entities/venda-conjunta.entity';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroVendasConjuntasDto } from './dto/filtro-vendas-conjuntas.dto';

@Injectable()
export class CooperativaRepository {
  async findAll(filtro: FiltroVendasConjuntasDto, usuario: UsuarioMercado) {
    const query = database<VendaConjunta>('vendas_conjuntas as vc').select(
      'vc.*',
    );
    if (usuario.perfil === 'aluno') {
      query.whereExists(function () {
        this.select('f.id')
          .from('fazendas as f')
          .whereRaw('f.turma_id = vc.turma_id')
          .where('f.usuario_id', usuario.id);
      });
    }
    if (usuario.perfil === 'professor') {
      query
        .join('turmas as t', 't.id', 'vc.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.produto_id) {
      query.where('vc.produto_id', filtro.produto_id);
    }
    if (filtro.status) {
      query.where('vc.status', filtro.status);
    }
    if (filtro.turma_id) {
      query.where('vc.turma_id', filtro.turma_id);
    }
    if (filtro.temporada) {
      query.where('vc.temporada', filtro.temporada);
    }
    return paginar(
      query.orderBy('vc.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async findOne(
    id: string,
    trx: Knex = database,
    lock = false,
  ): Promise<VendaConjunta | undefined> {
    const query = trx<VendaConjunta>('vendas_conjuntas').where({ id });
    if (lock) {
      query.forUpdate();
    }
    return query.first();
  }

  async create(
    dados: Partial<VendaConjunta>,
    trx: Knex.Transaction,
  ): Promise<VendaConjunta> {
    const [grupo] = await trx<VendaConjunta>('vendas_conjuntas')
      .insert(dados)
      .returning('*');
    return grupo;
  }

  async update(
    id: string,
    dados: Partial<VendaConjunta> & { taxa?: number; valor_liquido?: number },
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('vendas_conjuntas')
      .where({ id })
      .update({ ...dados, updated_at: trx.fn.now() });
  }
}
