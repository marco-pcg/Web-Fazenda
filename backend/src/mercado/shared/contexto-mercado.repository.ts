import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { FazendaMercado } from './mercado.types';

@Injectable()
export class ContextoMercadoRepositorio {
  async buscarFazenda(
    id: string,
    transacaoBanco: Knex = bancoDeDados,
  ): Promise<FazendaMercado | undefined> {
    return transacaoBanco<FazendaMercado>('fazendas').where({ id }).first();
  }

  async buscarFazendaDoUsuario(
    turmaId: string,
    usuarioId: string,
  ): Promise<FazendaMercado | undefined> {
    return bancoDeDados<FazendaMercado>('fazendas')
      .where({ turma_id: turmaId, usuario_id: usuarioId })
      .first();
  }

  async buscarTurma(
    id: string,
  ): Promise<{ id: string; professor_id: string } | undefined> {
    return bancoDeDados<{ id: string; professor_id: string }>('turmas')
      .where({ id })
      .first();
  }
}
