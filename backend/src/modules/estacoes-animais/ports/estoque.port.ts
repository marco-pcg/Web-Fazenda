import type { Knex } from 'knex';

export const ESTOQUE_PORT = 'ESTOQUE_PORT';

export interface EstoquePort {
  obterRacao(fazendaId: string, trx?: Knex.Transaction): Promise<number>;
  consumirRacao(
    fazendaId: string,
    quantidade: number,
    trx?: Knex.Transaction,
  ): Promise<void>;
  creditarProduto(
    fazendaId: string,
    produto: string,
    quantidade: number,
    trx?: Knex.Transaction,
  ): Promise<void>;
}
