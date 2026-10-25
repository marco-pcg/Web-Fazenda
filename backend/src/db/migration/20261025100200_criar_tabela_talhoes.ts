import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('talhoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('fazendaId')
      .notNullable()
      .references('id')
      .inTable('fazendas')
      .onDelete('CASCADE');
    table.string('codigo', 10).notNullable();
    table.integer('area').notNullable();
    table.string('status', 20).notNullable().defaultTo('livre');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('talhoes');
}
