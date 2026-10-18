import { Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { Fazenda, FazendasPort, Modificador } from '../fazendas.port';

@Injectable()
export class FazendasPortProvisorio implements FazendasPort {
  private modificadores: Modificador[] = [];

  listarPorTurma(turmaId: string, _trx?: Knex.Transaction): Promise<Fazenda[]> {
    console.log(`listarPorTurma(${turmaId}) provisório`);
    return Promise.resolve([]);
  }

  listarPorUsuario(
    usuarioId: string,
    _trx?: Knex.Transaction,
  ): Promise<Fazenda[]> {
    console.log(`listarPorUsuario(${usuarioId}) provisório`);
    return Promise.resolve([]);
  }

  buscarPorId(id: string, _trx?: Knex.Transaction): Promise<Fazenda | null> {
    return Promise.resolve({
      id,
      nome: 'Fazenda provisória',
      turmaId: null,
      usuarioId: null,
    });
  }

  pertenceAoUsuario(
    fazendaId: string,
    usuarioId: string,
    _trx?: Knex.Transaction,
  ): Promise<boolean> {
    console.log(`pertenceAoUsuario(${fazendaId}, ${usuarioId}) provisório`);
    return Promise.resolve(true);
  }

  aplicarModificadorTurma(
    turmaId: string,
    modificador: Modificador,
    _trx?: Knex.Transaction,
  ): Promise<void> {
    console.log(`aplicando modificador na turma ${turmaId}`);
    this.modificadores.push(modificador);
    return Promise.resolve();
  }

  reverterModificadorTurma(
    turmaId: string,
    eventoId: string,
    _trx?: Knex.Transaction,
  ): Promise<void> {
    console.log(`revertendo modificador na turma ${turmaId}`);
    this.modificadores = this.modificadores.filter(
      (modificador) => modificador.eventoId !== eventoId,
    );
    return Promise.resolve();
  }
}
