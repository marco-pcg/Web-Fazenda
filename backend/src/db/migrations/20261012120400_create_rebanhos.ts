import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rebanhos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('fazenda_id').notNullable();
    table.uuid('especie_id').notNullable().references('id').inTable('especies');
    table.integer('quantidade').notNullable().defaultTo(0);
    table
      .text('saude')
      .notNullable()
      .defaultTo('SAUDAVEL')
      .checkIn(['SAUDAVEL', 'SUBNUTRIDO']);
    table.timestamp('ultima_alimentacao_em');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('fazenda_id');
    table.index('especie_id');
    table.index('saude');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('rebanhos');
}
