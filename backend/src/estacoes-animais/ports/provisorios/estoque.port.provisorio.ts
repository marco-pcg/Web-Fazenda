import { BadRequestException } from '@nestjs/common';
import type { Knex } from 'knex';
import { EstoquePort } from '../estoque.port';

export class EstoquePortProvisorio implements EstoquePort {
  private racao: Record<string, number> = {};
  private produtos: Record<string, number> = {};

  obterRacao(fazendaId: string, _trx?: Knex.Transaction): Promise<number> {
    if (this.racao[fazendaId] === undefined) {
      this.racao[fazendaId] = 1000;
    }
    return Promise.resolve(this.racao[fazendaId]);
  }

  async consumirRacao(
    fazendaId: string,
    quantidade: number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const disponivel = await this.obterRacao(fazendaId, trx);
    if (quantidade > disponivel) {
      throw new BadRequestException('Ração insuficiente no estoque');
    }
    this.racao[fazendaId] = disponivel - quantidade;
  }

  creditarProduto(
    fazendaId: string,
    produto: string,
    quantidade: number,
    _trx?: Knex.Transaction,
  ): Promise<void> {
    const chave = `${fazendaId}-${produto}`;
    this.produtos[chave] = (this.produtos[chave] || 0) + quantidade;
    return Promise.resolve();
  }
}
