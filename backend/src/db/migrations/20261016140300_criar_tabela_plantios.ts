import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('plantios', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('talhao_id').notNullable().references('talhoes.id');
    table.uuid('cultura_id').notNullable().references('culturas.id');
    table.integer('quantidade').notNullable();
    table.integer('area_usada').notNullable();
    table.integer('agua_usada').notNullable();
    table.integer('temporada').notNullable();
    table.string('estacao', 20).notNullable();
    table.date('data_plantio').notNullable();
    table.date('data_prevista_colheita').notNullable();
    table.boolean('penalidade_rotacao').notNullable().defaultTo(false);
    table
      .enu('status', ['em_crescimento', 'pronto', 'colhido'])
      .notNullable()
      .defaultTo('em_crescimento');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('plantios');
}
