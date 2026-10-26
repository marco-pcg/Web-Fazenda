import { Injectable } from '@nestjs/common';
import { database as knex } from '../../db/knex-connection';
import { TurmasPort } from './turmas.port';

interface TurmaRow {
  id: string;
  professorId: string | null;
}

interface UsuarioRow {
  id: string;
  turmaId: string | null;
}

interface MatriculaRow {
  turmaId: string;
  alunoId: string;
}

@Injectable()
export class TurmasAdapter implements TurmasPort {
  async existe(turmaId: string): Promise<boolean> {
    const turma = await knex<TurmaRow>('turmas').where({ id: turmaId }).first();
    return !!turma;
  }

  async professorEhDaTurma(
    turmaId: string,
    usuarioId: string,
  ): Promise<boolean> {
    const turma = await knex<TurmaRow>('turmas')
      .where({ id: turmaId, professorId: usuarioId })
      .first();
    return !!turma;
  }

  async turmaDoUsuario(usuarioId: string): Promise<string | null> {
    const usuario = await knex<UsuarioRow>('usuarios')
      .where({ id: usuarioId })
      .first();
    if (usuario && usuario.turmaId) {
      return usuario.turmaId;
    }

    const matricula = await knex<MatriculaRow>('turma-alunos')
      .where({ alunoId: usuarioId })
      .first();
    return matricula ? matricula.turmaId : null;
  }
}
