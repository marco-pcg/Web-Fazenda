import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { AlvoEvento } from '../../common/enums/enums';
import { Fazenda, FazendasPort, Modificador } from './fazendas.port';

interface FazendaRow {
  id: string;
  nome: string;
  turma_id: string | null;
  usuario_id: string | null;
}

@Injectable()
export class FazendasAdapter implements FazendasPort {
  async listarPorTurma(turmaId: string): Promise<Fazenda[]> {
    return this.map(await knex<FazendaRow>('fazendas').where({ turma_id: turmaId }));
  }

  async listarPorUsuario(usuarioId: string): Promise<Fazenda[]> {
    return this.map(
      await knex<FazendaRow>('fazendas').where({ usuario_id: usuarioId }),
    );
  }

  async buscarPorId(id: string): Promise<Fazenda | null> {
    const fazenda = await knex<FazendaRow>('fazendas').where({ id }).first();
    return fazenda ? this.map([fazenda])[0] : null;
  }

  async pertenceAoUsuario(
    fazendaId: string,
    usuarioId: string,
  ): Promise<boolean> {
    return !!(await knex<FazendaRow>('fazendas')
      .where({ id: fazendaId, usuario_id: usuarioId })
      .first());
  }

  async aplicarModificadorTurma(
    turmaId: string,
    modificador: Modificador,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || knex;
    const fazendas = await db<FazendaRow>('fazendas')
      .select('id')
      .where({ turma_id: turmaId });

    for (const fazenda of fazendas) {
      await db('fazenda_modificadores_climaticos')
        .insert({
          fazenda_id: fazenda.id,
          evento_id: modificador.eventoId,
          alvo: modificador.alvo,
          multiplicador: modificador.multiplicador,
        })
        .onConflict(['fazenda_id', 'evento_id'])
        .ignore();

      const coluna =
        modificador.alvo === AlvoEvento.AGUA
          ? 'fator_agua'
          : 'fator_produtividade';
      await db('fazendas')
        .where({ id: fazenda.id })
        .update({
          [coluna]: db.raw('?? * ?', [coluna, modificador.multiplicador]),
        });
    }
  }

  async reverterModificadorTurma(
    turmaId: string,
    eventoId: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || knex;
    const modificadores = await db('fazenda_modificadores_climaticos as fmc')
      .join('fazendas as f', 'f.id', 'fmc.fazenda_id')
      .where({ 'f.turma_id': turmaId, 'fmc.evento_id': eventoId })
      .select('fmc.fazenda_id', 'fmc.alvo', 'fmc.multiplicador');

    for (const modificador of modificadores) {
      const coluna =
        modificador.alvo === AlvoEvento.AGUA
          ? 'fator_agua'
          : 'fator_produtividade';
      await db('fazendas')
        .where({ id: modificador.fazenda_id })
        .update({
          [coluna]: db.raw('?? / ?', [coluna, modificador.multiplicador]),
        });
    }

    await db('fazenda_modificadores_climaticos')
      .where({ evento_id: eventoId })
      .del();
  }

  private map(rows: FazendaRow[]): Fazenda[] {
    return rows.map((row) => ({
      id: row.id,
      nome: row.nome,
      turmaId: row.turma_id,
      usuarioId: row.usuario_id,
    }));
  }
}
