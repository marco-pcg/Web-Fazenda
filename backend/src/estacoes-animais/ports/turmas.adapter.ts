import { Injectable } from '@nestjs/common';
import { database as knex } from '../../db/knex-connection';
import { TurmasPort } from './turmas.port';

interface TurmaRow {
  id: string;
  professor_id: string | null;
}

interface UsuarioRow {
  id: string;
  turma_id: string | null;
}

interface MatriculaRow {
  turma_id: string;
  aluno_id: string;
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
      .where({ id: turmaId, professor_id: usuarioId })
      .first();
    return !!turma;
  }

  async turmaDoUsuario(usuarioId: string): Promise<string | null> {
    const usuario = await knex<UsuarioRow>('usuarios')
      .where({ id: usuarioId })
      .first();
    if (usuario && usuario.turma_id) {
      return usuario.turma_id;
    }

    const matricula = await knex<MatriculaRow>('turma_alunos')
      .where({ aluno_id: usuarioId })
      .first();
    return matricula ? matricula.turma_id : null;
  }
}
