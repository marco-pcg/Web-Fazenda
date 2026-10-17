import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('colheitas', (table) => {
    table.increments('id');
    table
      .integer('plantio_id')
      .notNullable()
      .unique()
      .references('plantios.id');
    table.date('data_colheita').notNullable();
    table.boolean('antecipada').notNullable().defaultTo(false);
    table.float('perda_percentual').notNullable().defaultTo(0);
    table.float('quantidade_colhida').notNullable();
    table.float('valor_estimado').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('colheitas');
}
