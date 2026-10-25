import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('plantios', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('talhaoId').notNullable().references('id').inTable('talhoes');
    table.uuid('culturaId').notNullable().references('id').inTable('culturas');
    table.integer('quantidade').notNullable();
    table.integer('areaUsada').notNullable();
    table.integer('aguaUsada').notNullable();
    table.integer('temporada').notNullable();
    table.string('estacao', 20).notNullable();
    table.string('dataPlantio', 10).notNullable();
    table.string('dataPrevistaColheita', 10).notNullable();
    table.boolean('penalidadeRotacao').notNullable().defaultTo(false);
    table.string('status', 20).notNullable().defaultTo('em_crescimento');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('plantios');
}
