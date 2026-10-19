import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { Ordem } from '../ordens/entities/ordem.entity';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroOrdensDto } from './dto/filtro-ordens.dto';

@Injectable()
export class OrdensRepositorio {
  async listar(filtro: FiltroOrdensDto, usuario: UsuarioMercado) {
    const consulta = bancoDeDados<Ordem>('ordens as o')
      .leftJoin('fazendas as f', 'f.id', 'o.fazenda_id')
      .select('o.*');
    if (usuario.perfil === 'aluno') {
      consulta.where('o.usuario_id', usuario.id);
    }
    if (usuario.perfil === 'comprador') {
      consulta.where((consultaAgrupada) => {
        consultaAgrupada
          .where('o.usuario_id', usuario.id)
          .orWhere((ofertasAbertas) => {
            ofertasAbertas
              .where('o.tipo', 'VENDA')
              .where('o.modalidade', 'AVULSA')
              .where('o.status', 'ABERTA');
          });
      });
    }
    if (usuario.perfil === 'professor') {
      consulta
        .join('turmas as t', 't.id', 'f.turma_id')
        .where('t.professor_id', usuario.id);
    }
    if (filtro.tipo) {
      consulta.where('o.tipo', filtro.tipo);
    }
    if (filtro.status) {
      consulta.where('o.status', filtro.status);
    }
    if (filtro.produto_id) {
      consulta.where('o.produto_id', filtro.produto_id);
    }
    if (filtro.modalidade) {
      consulta.where('o.modalidade', filtro.modalidade);
    }
    return paginar(
      consulta.orderBy('o.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }

  async buscarPorId(
    id: string,
    transacaoBanco: Knex = bancoDeDados,
    bloqueio = false,
  ): Promise<Ordem | undefined> {
    const consulta = transacaoBanco<Ordem>('ordens').where({ id });
    if (bloqueio) {
      consulta.forUpdate();
    }
    return consulta.first();
  }

  async buscarContribuicao(
    id: string,
    grupoId: string,
    transacaoBanco: Knex.Transaction,
    bloqueio = false,
  ): Promise<Ordem | undefined> {
    const consulta = transacaoBanco<Ordem>('ordens').where({
      id,
      venda_conjunta_id: grupoId,
      tipo: 'VENDA',
    });
    if (bloqueio) {
      consulta.forUpdate();
    }
    return consulta.first();
  }

  async buscarContribuicaoAberta(
    grupoId: string,
    fazendaId: string,
    transacaoBanco: Knex.Transaction,
  ): Promise<Ordem | undefined> {
    return transacaoBanco<Ordem>('ordens')
      .where({
        venda_conjunta_id: grupoId,
        fazenda_id: fazendaId,
        status: 'ABERTA',
      })
      .first();
  }

  async listarContribuicoes(
    grupoId: string,
    status: 'ABERTA' | 'EXECUTADA',
    transacaoBanco: Knex.Transaction,
  ): Promise<Ordem[]> {
    return transacaoBanco<Ordem>('ordens')
      .where({ venda_conjunta_id: grupoId, status, tipo: 'VENDA' })
      .orderBy('id');
  }

  async listarContribuicoesAtivas(grupoId: string): Promise<Ordem[]> {
    return bancoDeDados<Ordem>('ordens')
      .where({ venda_conjunta_id: grupoId, tipo: 'VENDA' })
      .whereNot('status', 'CANCELADA')
      .orderBy('created_at');
  }

  async criar(
    dados: Partial<Ordem>,
    transacaoBanco: Knex.Transaction,
  ): Promise<Ordem> {
    const [ordem] = await transacaoBanco<Ordem>('ordens')
      .insert(dados)
      .returning('*');
    return ordem;
  }

  async atualizar(
    id: string,
    dados: Partial<Ordem>,
    transacaoBanco: Knex.Transaction,
  ): Promise<Ordem> {
    const [ordem] = await transacaoBanco<Ordem>('ordens')
      .where({ id })
      .update({ ...dados, updated_at: transacaoBanco.fn.now() })
      .returning('*');
    return ordem;
  }

  async executarContribuicoes(
    grupoId: string,
    preco: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('ordens')
      .where({ venda_conjunta_id: grupoId, status: 'ABERTA', tipo: 'VENDA' })
      .update({
        status: 'EXECUTADA',
        preco_unitario: preco,
        updated_at: transacaoBanco.fn.now(),
      });
  }
}
