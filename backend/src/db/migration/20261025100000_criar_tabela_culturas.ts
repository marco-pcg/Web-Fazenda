import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('culturas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 60).notNullable().unique();
    table.integer('areaPorUnidade').notNullable();
    table.integer('aguaPorUnidade').notNullable();
    table.integer('diasCrescimento').notNullable();
    table.float('rendimentoPorUnidade').notNullable();
    table.float('valorPorUnidade').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('culturas_estacoes', (table) => {
    table.increments('id').primary();
    table
      .uuid('culturaId')
      .notNullable()
      .references('id')
      .inTable('culturas')
      .onDelete('CASCADE');
    table.string('estacao', 20).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('culturas_estacoes');
  await knex.schema.dropTableIfExists('culturas');
}
