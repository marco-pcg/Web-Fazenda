import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('estacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .text('nome')
      .notNullable()
      .unique()
      .checkIn(['PRIMAVERA', 'VERAO', 'OUTONO', 'INVERNO']);
    table.integer('ordem').notNullable();
    table.decimal('fator_produtividade', 10, 4).notNullable().defaultTo(1);
    table.decimal('fator_agua', 10, 4).notNullable().defaultTo(1);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('estacoes');
}
