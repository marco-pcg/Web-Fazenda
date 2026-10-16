import type { Knex } from 'knex';

const especies = [
  {
    nome: 'Galinha',
    produto: 'ovos',
    unidade_produto: 'duzia',
    consumo_racao_por_animal: 4,
    producao_por_animal: 8,
    preco_base: 12,
    taxa_crescimento: 0.15,
  },
  {
    nome: 'Vaca',
    produto: 'leite',
    unidade_produto: 'litro',
    consumo_racao_por_animal: 60,
    producao_por_animal: 300,
    preco_base: 2.5,
    taxa_crescimento: 0.03,
  },
  {
    nome: 'Ovelha',
    produto: 'la',
    unidade_produto: 'kg',
    consumo_racao_por_animal: 25,
    producao_por_animal: 4,
    preco_base: 20,
    taxa_crescimento: 0.08,
  },
  {
    nome: 'Porco',
    produto: 'carne',
    unidade_produto: 'kg',
    consumo_racao_por_animal: 45,
    producao_por_animal: 70,
    preco_base: 15,
    taxa_crescimento: 0.1,
  },
];

export async function seed(knex: Knex): Promise<void> {
  await knex('especies').insert(especies).onConflict('nome').merge();
}
