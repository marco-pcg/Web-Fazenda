import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('alimentacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('rebanho_id')
      .notNullable()
      .references('id')
      .inTable('rebanhos')
      .onDelete('CASCADE');
    table.uuid('temporada_id').references('id').inTable('temporadas');
    table.decimal('racao_necessaria', 10, 4).notNullable();
    table.decimal('racao_fornecida', 10, 4).notNullable();
    table.decimal('proporcao_atendida', 5, 4).notNullable();
    table.boolean('subnutrido').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('rebanho_id');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('alimentacoes');
}
