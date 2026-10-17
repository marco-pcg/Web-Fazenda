import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('producoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('rebanho_id')
      .notNullable()
      .references('id')
      .inTable('rebanhos')
      .onDelete('CASCADE');
    table
      .uuid('temporada_id')
      .notNullable()
      .references('id')
      .inTable('temporadas');
    table.text('produto').notNullable();
    table.decimal('quantidade', 10, 4).notNullable();
    table.decimal('fator_aplicado', 10, 4).notNullable().defaultTo(1);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['rebanho_id', 'temporada_id']);
    table.index('produto');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('producoes');
}
