import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('talhoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('fazenda_id')
      .notNullable()
      .references('fazendas.id')
      .onDelete('CASCADE');
    table.string('codigo', 10).notNullable();
    table.integer('area').notNullable();
    table.enu('status', ['livre', 'plantado']).notNullable().defaultTo('livre');
    table.timestamps(true, true);

    table.unique(['fazenda_id', 'codigo']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('talhoes');
}
