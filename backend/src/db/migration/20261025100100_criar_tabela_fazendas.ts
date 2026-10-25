import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('fazendas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 80).notNullable();
    table
      .uuid('turmaId')
      .references('id')
      .inTable('turmas')
      .onDelete('SET NULL');
    table
      .uuid('usuarioId')
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
    table.integer('aguaTotal').notNullable();
    table.integer('aguaDisponivel').notNullable();
    table.string('estacaoAtual', 20).notNullable();
    table.integer('temporadaAtual').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('fazendas');
}
