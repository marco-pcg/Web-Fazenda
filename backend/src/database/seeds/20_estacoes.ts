import type { Knex } from 'knex';

const estacoes = [
  { nome: 'PRIMAVERA', ordem: 1, fator_produtividade: 1.1, fator_agua: 1.0 },
  { nome: 'VERAO', ordem: 2, fator_produtividade: 1.2, fator_agua: 1.3 },
  { nome: 'OUTONO', ordem: 3, fator_produtividade: 1.0, fator_agua: 0.9 },
  { nome: 'INVERNO', ordem: 4, fator_produtividade: 0.7, fator_agua: 0.7 },
];

export async function seed(knex: Knex): Promise<void> {
  await knex('estacoes').insert(estacoes).onConflict('nome').merge();
}
