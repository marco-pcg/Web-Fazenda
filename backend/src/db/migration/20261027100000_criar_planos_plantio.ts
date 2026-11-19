import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('planos_plantio', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('talhaoId')
      .notNullable()
      .references('id')
      .inTable('talhoes')
      .onDelete('CASCADE');
    table.integer('temporada').notNullable();
    table.string('estacao', 20).notNullable();
    table.jsonb('recomendacao').notNullable();
    table
      .timestamp('criadoEm', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index('talhaoId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('planos_plantio');
}
