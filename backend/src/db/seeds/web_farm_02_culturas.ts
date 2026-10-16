import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw(
    'TRUNCATE colheitas, plantios, talhoes, fazendas, culturas RESTART IDENTITY CASCADE',
  );

  await knex('culturas').insert([
    {
      nome: 'Milho',
      estacoes: ['primavera', 'verao'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 90,
      rendimento_por_unidade: 120,
      valor_por_unidade: 10,
    },
    {
      nome: 'Trigo',
      estacoes: ['inverno', 'primavera'],
      area_por_unidade: 1,
      agua_por_unidade: 2,
      dias_crescimento: 120,
      rendimento_por_unidade: 80,
      valor_por_unidade: 15,
    },
    {
      nome: 'Feijão',
      estacoes: ['primavera', 'verao', 'outono'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 75,
      rendimento_por_unidade: 60,
      valor_por_unidade: 8,
    },
    {
      nome: 'Soja',
      estacoes: ['verao'],
      area_por_unidade: 1,
      agua_por_unidade: 2,
      dias_crescimento: 110,
      rendimento_por_unidade: 90,
      valor_por_unidade: 14,
    },
    {
      nome: 'Alface',
      estacoes: ['primavera', 'verao', 'outono', 'inverno'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 45,
      rendimento_por_unidade: 30,
      valor_por_unidade: 5,
    },
    {
      nome: 'Tomate',
      estacoes: ['primavera', 'verao'],
      area_por_unidade: 2,
      agua_por_unidade: 3,
      dias_crescimento: 100,
      rendimento_por_unidade: 150,
      valor_por_unidade: 25,
    },
  ]);
}
