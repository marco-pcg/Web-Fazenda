import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { Ordem } from '../ordens/entities/ordem.entity';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroOrdensDto } from './dto/filtro-ordens.dto';

@Injectable()
export class OrdensRepository {
  async findAll(filtro: FiltroOrdensDto, usuario: UsuarioMercado) {
    const query = database<Ordem>('ordens as o')
      .leftJoin('fazendas as f', 'f.id', 'o.fazenda_id')
      .select('o.*');
    if (usuario.perfil === 'aluno') {
      query.where('o.usuario_id', usuario.id);
    }
    if (usuario.perfil === 'comprador') {
      query.where((builder) => {
        builder.where('o.usuario_id', usuario.id).orWhere((open) => {
          open
            .where('o.tipo', 'VENDA')
            .where('o.modalidade', 'AVULSA')
            .where('o.status', 'ABERTA');
        });
      });
    }
    if (usuario.perfil === 'professor') {
      query
        .join('turmas as t', 't.id', 'f.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.tipo) {
      query.where('o.tipo', filtro.tipo);
    }
    if (filtro.status) {
      query.where('o.status', filtro.status);
    }
    if (filtro.produto_id) {
      query.where('o.produto_id', filtro.produto_id);
    }
    if (filtro.modalidade) {
      query.where('o.modalidade', filtro.modalidade);
    }
    return paginar(
      query.orderBy('o.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async findOne(
    id: string,
    trx: Knex = database,
    lock = false,
  ): Promise<Ordem | undefined> {
    const query = trx<Ordem>('ordens').where({ id });
    if (lock) {
      query.forUpdate();
    }
    return query.first();
  }

  async findContribution(
    id: string,
    grupoId: string,
    trx: Knex.Transaction,
    lock = false,
  ): Promise<Ordem | undefined> {
    const query = trx<Ordem>('ordens').where({
      id,
      venda_conjunta_id: grupoId,
      tipo: 'VENDA',
    });
    if (lock) {
      query.forUpdate();
    }
    return query.first();
  }

  async findOpenContribution(
    grupoId: string,
    fazendaId: string,
    trx: Knex.Transaction,
  ): Promise<Ordem | undefined> {
    return trx<Ordem>('ordens')
      .where({
        venda_conjunta_id: grupoId,
        fazenda_id: fazendaId,
        status: 'ABERTA',
      })
      .first();
  }

  async findContributions(
    grupoId: string,
    status: 'ABERTA' | 'EXECUTADA',
    trx: Knex.Transaction,
  ): Promise<Ordem[]> {
    return trx<Ordem>('ordens')
      .where({ venda_conjunta_id: grupoId, status, tipo: 'VENDA' })
      .orderBy('id');
  }

  async findActiveContributions(grupoId: string): Promise<Ordem[]> {
    return database<Ordem>('ordens')
      .where({ venda_conjunta_id: grupoId, tipo: 'VENDA' })
      .whereNot('status', 'CANCELADA')
      .orderBy('created_at');
  }

  async create(dados: Partial<Ordem>, trx: Knex.Transaction): Promise<Ordem> {
    const [ordem] = await trx<Ordem>('ordens').insert(dados).returning('*');
    return ordem;
  }

  async update(
    id: string,
    dados: Partial<Ordem>,
    trx: Knex.Transaction,
  ): Promise<Ordem> {
    const [ordem] = await trx<Ordem>('ordens')
      .where({ id })
      .update({ ...dados, updated_at: trx.fn.now() })
      .returning('*');
    return ordem;
  }

  async executeContributions(
    grupoId: string,
    preco: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('ordens')
      .where({ venda_conjunta_id: grupoId, status: 'ABERTA', tipo: 'VENDA' })
      .update({
        status: 'EXECUTADA',
        preco_unitario: preco,
        updated_at: trx.fn.now(),
      });
  }
}
