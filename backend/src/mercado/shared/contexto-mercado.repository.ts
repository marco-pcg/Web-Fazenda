import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { FazendaMercado } from './mercado.types';

@Injectable()
export class ContextoMercadoRepositorio {
  buscarFazenda(
    id: string,
    trx: Knex = database,
  ): Promise<FazendaMercado | undefined> {
    return trx('fazendas')
      .select('id', 'usuarioId', 'turmaId', 'temporadaAtual')
      .where({ id })
      .first();
  }

  async alunoTemFazendaNaTurma(turmaId: string, usuarioId: string) {
    const fazenda = await database('fazendas')
      .where({ turmaId, usuarioId })
      .first();
    return Boolean(fazenda);
  }

  async professorDaTurma(turmaId: string, usuarioId: string) {
    const turma = await database('turmas')
      .where({ id: turmaId, professorId: usuarioId })
      .first();
    return Boolean(turma);
  }
}
