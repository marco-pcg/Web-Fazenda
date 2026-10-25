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
      aguaTotal: 14,
      aguaDisponivel: 14,
      estacaoAtual: 'primavera',
      temporadaAtual: 1,
    },
    {
      id: feliz,
      nome: 'Fazendinha Feliz',
      aguaTotal: 20,
      aguaDisponivel: 20,
      estacaoAtual: 'primavera',
      temporadaAtual: 2,
    },
  ]);

  await knex('talhoes').insert([
    { id: 'a4a97df6-7f12-489d-b7e0-ec0ff5b86220', fazendaId: esperanca, codigo: 'A1', area: 2 },
    { id: '3b0fe4e7-b982-407f-a4ba-866eadb4d9b3', fazendaId: esperanca, codigo: 'A2', area: 2 },
    { id: '021ab138-1434-42d8-83f9-fffc6b834c4e', fazendaId: esperanca, codigo: 'A3', area: 2 },
    { id: '66e13d1a-0754-4d4e-9509-786fd279aded', fazendaId: esperanca, codigo: 'A4', area: 2 },
    { id: '3c2a6216-ac11-40ca-9367-11a1544826d7', fazendaId: esperanca, codigo: 'A5', area: 2 },
    { id: talhaoB1, fazendaId: feliz, codigo: 'B1', area: 4 },
    { id: 'ced12522-39b2-4052-8ba2-79518f00a6ff', fazendaId: feliz, codigo: 'B2', area: 4 },
    { id: 'c8ef28fe-c66a-4cf0-9fb6-57801a3396ab', fazendaId: feliz, codigo: 'B3', area: 3 },
  ]);

  await knex('plantios').insert({
    id: plantioAntigo,
    talhaoId: talhaoB1,
    culturaId: milho,
    quantidade: 4,
    areaUsada: 4,
    aguaUsada: 4,
    temporada: 1,
    estacao: 'verao',
    dataPlantio: '2026-01-10',
    dataPrevistaColheita: '2026-04-10',
    status: 'colhido',
  });

  await knex('colheitas').insert({
    id: '9d22121b-1d50-49a3-a069-11e6755f421b',
    plantioId: plantioAntigo,
    dataColheita: '2026-04-12',
    antecipada: false,
    perdaPercentual: 0,
    quantidadeColhida: 480,
    valorEstimado: 40,
  });
}
