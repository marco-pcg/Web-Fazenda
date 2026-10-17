import { BadRequestException } from '@nestjs/common';
import { EstoquePort } from '../estoque.port';

export class EstoquePortProvisorio implements EstoquePort {
  private racao: Record<string, number> = {};
  private produtos: Record<string, number> = {};

  async obterRacao(fazendaId: string): Promise<number> {
    if (this.racao[fazendaId] === undefined) {
      this.racao[fazendaId] = 1000;
    }
    return this.racao[fazendaId];
  }

  async consumirRacao(fazendaId: string, quantidade: number): Promise<void> {
    const disponivel = await this.obterRacao(fazendaId);
    if (quantidade > disponivel) {
      throw new BadRequestException('Ração insuficiente no estoque');
    }
    this.racao[fazendaId] = disponivel - quantidade;
  }

  async creditarProduto(
    fazendaId: string,
    produto: string,
    quantidade: number,
  ): Promise<void> {
    const chave = `${fazendaId}-${produto}`;
    this.produtos[chave] = (this.produtos[chave] || 0) + quantidade;
  }
}
