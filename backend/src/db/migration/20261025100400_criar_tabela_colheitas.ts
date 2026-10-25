import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('colheitas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('plantioId')
      .notNullable()
      .unique()
      .references('id')
      .inTable('plantios');
    table.string('dataColheita', 10).notNullable();
    table.boolean('antecipada').notNullable().defaultTo(false);
    table.float('perdaPercentual').notNullable().defaultTo(0);
    table.float('quantidadeColhida').notNullable();
    table.float('valorEstimado').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('colheitas');
}
