import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('fazendas').insert([
    {
      nome: 'Fazenda Esperança',
      turma_id: 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5',
      usuario_id: '087bfe24-cdeb-4e99-a2e8-a11d968bb17c',
      agua_total: 14,
      agua_disponivel: 14,
      estacao_atual: 'primavera',
      temporada_atual: 1,
    },
    {
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
    { fazenda_id: 1, codigo: 'A1', area: 2 },
    { fazenda_id: 1, codigo: 'A2', area: 2 },
    { fazenda_id: 1, codigo: 'A3', area: 2 },
    { fazenda_id: 1, codigo: 'A4', area: 2 },
    { fazenda_id: 1, codigo: 'A5', area: 2 },
    { fazenda_id: 2, codigo: 'B1', area: 4 },
    { fazenda_id: 2, codigo: 'B2', area: 4 },
    { fazenda_id: 2, codigo: 'B3', area: 3 },
  ]);

  await knex('plantios').insert({
    talhao_id: 6,
    cultura_id: 1,
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
    plantio_id: 1,
    data_colheita: '2026-04-12',
    antecipada: false,
    perda_percentual: 0,
    quantidade_colhida: 480,
    valor_estimado: 40,
  });
}
