import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('temporadas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('turma_id').notNullable();
    table.uuid('estacao_id').notNullable().references('id').inTable('estacoes');
    table.integer('numero').notNullable();
    table.text('nome').notNullable();
    table
      .text('status')
      .notNullable()
      .defaultTo('PLANEJADA')
      .checkIn(['PLANEJADA', 'ATIVA', 'PROCESSANDO', 'ENCERRADA']);
    table.timestamp('data_inicio');
    table.timestamp('data_fim');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('turma_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('temporadas');
}
