import { BadRequestException, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { EstoquePort } from './estoque.port';

interface EstoqueRow {
  fazenda_id: string;
  racao: string | number;
  produtos: Record<string, number>;
}

@Injectable()
export class EstoqueAdapter implements EstoquePort {
  async obterRacao(fazendaId: string, trx?: Knex.Transaction): Promise<number> {
    const estoque = await this.buscar(fazendaId, trx);
    return estoque ? Number(estoque.racao) : 0;
  }

  async consumirRacao(
    fazendaId: string,
    quantidade: number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || knex;
    const estoque = await this.buscar(fazendaId, trx);
    const disponivel = estoque ? Number(estoque.racao) : 0;
    if (quantidade > disponivel) {
      throw new BadRequestException('Ração insuficiente no estoque');
    }

    if (!estoque) {
      return;
    }

    await db('estoques')
      .where({ fazenda_id: fazendaId })
      .update({ racao: disponivel - quantidade, updated_at: db.fn.now() });
  }

  async creditarProduto(
    fazendaId: string,
    produto: string,
    quantidade: number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || knex;
    const estoque = await this.buscar(fazendaId, trx);
    const produtos = { ...(estoque?.produtos || {}) };
    produtos[produto] = Number(produtos[produto] || 0) + quantidade;

    if (estoque) {
      await db('estoques')
        .where({ fazenda_id: fazendaId })
        .update({ produtos, updated_at: db.fn.now() });
      return;
    }

    await db('estoques').insert({
      fazenda_id: fazendaId,
      racao: 0,
      produtos,
    });
  }

  private buscar(
    fazendaId: string,
    trx?: Knex.Transaction,
  ): Promise<EstoqueRow | undefined> {
    const db = trx || knex;
    return db<EstoqueRow>('estoques').where({ fazenda_id: fazendaId }).first();
  }
}
