import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('fazendas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 80).notNullable();
    table
      .uuid('turma_id')
      .references('id')
      .inTable('turmas')
      .onDelete('SET NULL');
    table
      .uuid('usuario_id')
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    table.integer('agua_total').notNullable();
    table.integer('agua_disponivel').notNullable();
    table
      .enu('estacao_atual', ['primavera', 'verao', 'outono', 'inverno'])
      .notNullable();
    table.integer('temporada_atual').notNullable().defaultTo(1);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('fazendas');
}
