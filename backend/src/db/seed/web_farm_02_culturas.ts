import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('colheitas').del();
  await knex('plantios').del();
  await knex('talhoes').del();
  await knex('fazendas').del();
  await knex('culturas_estacoes').del();
  await knex('culturas').del();

  const milho = 'eea2c902-498b-43c5-9c81-d140e6f66e4d';
  const trigo = '2f95e085-7ddd-4be2-978a-5dbe1e55f415';
  const feijao = '9960908b-5dab-4ea5-b764-436ae8f59af0';
  const soja = '46535eba-307c-4604-9a2f-6669d61f44fd';
  const alface = 'd48aaf8b-a6ed-46ef-8dc1-c11b7c6e088f';
  const tomate = 'bde2a30d-80ba-40d4-992e-8139f22a98b6';

  await knex('culturas').insert([
    {
      id: milho,
      nome: 'Milho',
      areaPorUnidade: 1,
      aguaPorUnidade: 1,
      diasCrescimento: 90,
      rendimentoPorUnidade: 120,
      valorPorUnidade: 10,
    },
    {
      id: trigo,
      nome: 'Trigo',
      areaPorUnidade: 1,
      aguaPorUnidade: 2,
      diasCrescimento: 120,
      rendimentoPorUnidade: 80,
      valorPorUnidade: 15,
    },
    {
      id: feijao,
      nome: 'Feijão',
      areaPorUnidade: 1,
      aguaPorUnidade: 1,
      diasCrescimento: 75,
      rendimentoPorUnidade: 60,
      valorPorUnidade: 8,
    },
    {
      id: soja,
      nome: 'Soja',
      areaPorUnidade: 1,
      aguaPorUnidade: 2,
      diasCrescimento: 110,
      rendimentoPorUnidade: 90,
      valorPorUnidade: 14,
    },
    {
      id: alface,
      nome: 'Alface',
      areaPorUnidade: 1,
      aguaPorUnidade: 1,
      diasCrescimento: 45,
      rendimentoPorUnidade: 30,
      valorPorUnidade: 5,
    },
    {
      id: tomate,
      nome: 'Tomate',
      areaPorUnidade: 2,
      aguaPorUnidade: 3,
      diasCrescimento: 100,
      rendimentoPorUnidade: 150,
      valorPorUnidade: 25,
    },
  ]);

  await knex('culturas_estacoes').insert([
    { culturaId: milho, estacao: 'primavera' },
    { culturaId: milho, estacao: 'verao' },
    { culturaId: trigo, estacao: 'inverno' },
    { culturaId: trigo, estacao: 'primavera' },
    { culturaId: feijao, estacao: 'primavera' },
    { culturaId: feijao, estacao: 'verao' },
    { culturaId: feijao, estacao: 'outono' },
    { culturaId: soja, estacao: 'verao' },
    { culturaId: alface, estacao: 'primavera' },
    { culturaId: alface, estacao: 'verao' },
    { culturaId: alface, estacao: 'outono' },
    { culturaId: alface, estacao: 'inverno' },
    { culturaId: tomate, estacao: 'primavera' },
    { culturaId: tomate, estacao: 'verao' },
  ]);
}
