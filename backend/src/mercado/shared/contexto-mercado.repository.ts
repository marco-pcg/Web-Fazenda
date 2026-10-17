import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { FazendaMercado } from './mercado.types';

@Injectable()
export class ContextoMercadoRepository {
  async findFazenda(
    id: string,
    trx: Knex = database,
  ): Promise<FazendaMercado | undefined> {
    return trx<FazendaMercado>('fazendas').where({ id }).first();
  }

  async findFazendaDoUsuario(
    turmaId: string,
    usuarioId: string,
  ): Promise<FazendaMercado | undefined> {
    return database<FazendaMercado>('fazendas')
      .where({ turma_id: turmaId, usuario_id: usuarioId })
      .first();
  }

  async findTurma(
    id: string,
  ): Promise<{ id: string; professor_id: string } | undefined> {
    return database<{ id: string; professor_id: string }>('turmas')
      .where({ id })
      .first();
  }
}
