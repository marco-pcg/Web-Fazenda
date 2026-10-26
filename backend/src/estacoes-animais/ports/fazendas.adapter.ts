import { Injectable } from '@nestjs/common';
import { database as knex } from '../../db/knex-connection';
import { Fazenda, FazendasPort, Modificador } from './fazendas.port';

interface FazendaRow {
  id: string;
  nome: string;
  turmaId: string | null;
  usuarioId: string | null;
}

@Injectable()
export class FazendasAdapter implements FazendasPort {
  private modificadores: Modificador[] = [];

  async listarPorTurma(turmaId: string): Promise<Fazenda[]> {
    const fazendas = await knex<FazendaRow>('fazendas')
      .select('id', 'nome', 'turmaId', 'usuarioId')
      .where({ turmaId });
    return fazendas.map((fazenda) => this.paraFazenda(fazenda));
  }

  async listarPorUsuario(usuarioId: string): Promise<Fazenda[]> {
    const fazendas = await knex<FazendaRow>('fazendas')
      .select('id', 'nome', 'turmaId', 'usuarioId')
      .where({ usuarioId });
    return fazendas.map((fazenda) => this.paraFazenda(fazenda));
  }

  async buscarPorId(id: string): Promise<Fazenda | null> {
    const fazenda = await knex<FazendaRow>('fazendas')
      .select('id', 'nome', 'turmaId', 'usuarioId')
      .where({ id })
      .first();
    return fazenda ? this.paraFazenda(fazenda) : null;
  }

  async pertenceAoUsuario(
    fazendaId: string,
    usuarioId: string,
  ): Promise<boolean> {
    const fazenda = await knex<FazendaRow>('fazendas')
      .where({ id: fazendaId, usuarioId })
      .first();
    return !!fazenda;
  }

  aplicarModificadorTurma(
    turmaId: string,
    modificador: Modificador,
  ): Promise<void> {
    console.log(`aplicando modificador na turma ${turmaId}`);
    this.modificadores.push(modificador);
    return Promise.resolve();
  }

  reverterModificadorTurma(turmaId: string, eventoId: string): Promise<void> {
    console.log(`revertendo modificador na turma ${turmaId}`);
    this.modificadores = this.modificadores.filter(
      (modificador) => modificador.eventoId !== eventoId,
    );
    return Promise.resolve();
  }

  private paraFazenda(fazenda: FazendaRow): Fazenda {
    return {
      id: fazenda.id,
      nome: fazenda.nome,
      turmaId: fazenda.turmaId,
      usuarioId: fazenda.usuarioId,
    };
  }
}
