import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const esperanca = '48ad956a-2b13-4ca9-a2e5-147b9ac129a0';
  const feliz = '3897cc1a-43e5-44dd-a4d2-74972c0fabb7';
  const talhaoB1 = 'd0afb475-9d55-46d6-ad8b-1280b492b495';
  const milho = 'eea2c902-498b-43c5-9c81-d140e6f66e4d';
  const plantioAntigo = 'db12511d-bc0c-40ac-aaf5-8cc9ef2017b3';

  await knex('fazendas').insert([
    {
      id: esperanca,
      nome: 'Fazenda Esperança',
      turma_id: 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5',
      usuario_id: '087bfe24-cdeb-4e99-a2e8-a11d968bb17c',
      agua_total: 14,
      agua_disponivel: 14,
      estacao_atual: 'primavera',
      temporada_atual: 1,
    },
    {
      id: feliz,
      nome: 'Fazendinha Feliz',
      turma_id: 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5',
      usuario_id: '72dad241-28b9-4a6f-ac81-528e80dfd2d0',
      agua_total: 20,
      agua_disponivel: 20,
      estacao_atual: 'primavera',
      temporada_atual: 2,
    },
  ]);

  await knex('talhoes').insert([
    { id: 'a4a97df6-7f12-489d-b7e0-ec0ff5b86220', fazenda_id: esperanca, codigo: 'A1', area: 2 },
    { id: '3b0fe4e7-b982-407f-a4ba-866eadb4d9b3', fazenda_id: esperanca, codigo: 'A2', area: 2 },
    { id: '021ab138-1434-42d8-83f9-fffc6b834c4e', fazenda_id: esperanca, codigo: 'A3', area: 2 },
    { id: '66e13d1a-0754-4d4e-9509-786fd279aded', fazenda_id: esperanca, codigo: 'A4', area: 2 },
    { id: '3c2a6216-ac11-40ca-9367-11a1544826d7', fazenda_id: esperanca, codigo: 'A5', area: 2 },
    { id: talhaoB1, fazenda_id: feliz, codigo: 'B1', area: 4 },
    { id: 'ced12522-39b2-4052-8ba2-79518f00a6ff', fazenda_id: feliz, codigo: 'B2', area: 4 },
    { id: 'c8ef28fe-c66a-4cf0-9fb6-57801a3396ab', fazenda_id: feliz, codigo: 'B3', area: 3 },
  ]);

  await knex('plantios').insert({
    id: plantioAntigo,
    talhao_id: talhaoB1,
    cultura_id: milho,
    quantidade: 4,
    area_usada: 4,
    agua_usada: 4,
    temporada: 1,
    estacao: 'verao',
    data_plantio: '2026-01-10',
    data_prevista_colheita: '2026-04-10',
    status: 'colhido',
  });

  await knex('colheitas').insert({
    id: '9d22121b-1d50-49a3-a069-11e6755f421b',
    plantio_id: plantioAntigo,
    data_colheita: '2026-04-12',
    antecipada: false,
    perda_percentual: 0,
    quantidade_colhida: 480,
    valor_estimado: 40,
  });
}
