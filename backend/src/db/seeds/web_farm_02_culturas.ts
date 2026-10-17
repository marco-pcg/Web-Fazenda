import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw(
    'TRUNCATE colheitas, plantios, talhoes, fazendas, culturas CASCADE',
  );

  await knex('culturas').insert([
    {
      id: 'eea2c902-498b-43c5-9c81-d140e6f66e4d',
      nome: 'Milho',
      estacoes: ['primavera', 'verao'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 90,
      rendimento_por_unidade: 120,
      valor_por_unidade: 10,
    },
    {
      id: '2f95e085-7ddd-4be2-978a-5dbe1e55f415',
      nome: 'Trigo',
      estacoes: ['inverno', 'primavera'],
      area_por_unidade: 1,
      agua_por_unidade: 2,
      dias_crescimento: 120,
      rendimento_por_unidade: 80,
      valor_por_unidade: 15,
    },
    {
      id: '9960908b-5dab-4ea5-b764-436ae8f59af0',
      nome: 'Feijão',
      estacoes: ['primavera', 'verao', 'outono'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 75,
      rendimento_por_unidade: 60,
      valor_por_unidade: 8,
    },
    {
      id: '46535eba-307c-4604-9a2f-6669d61f44fd',
      nome: 'Soja',
      estacoes: ['verao'],
      area_por_unidade: 1,
      agua_por_unidade: 2,
      dias_crescimento: 110,
      rendimento_por_unidade: 90,
      valor_por_unidade: 14,
    },
    {
      id: 'd48aaf8b-a6ed-46ef-8dc1-c11b7c6e088f',
      nome: 'Alface',
      estacoes: ['primavera', 'verao', 'outono', 'inverno'],
      area_por_unidade: 1,
      agua_por_unidade: 1,
      dias_crescimento: 45,
      rendimento_por_unidade: 30,
      valor_por_unidade: 5,
    },
    {
      id: 'bde2a30d-80ba-40d4-992e-8139f22a98b6',
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
