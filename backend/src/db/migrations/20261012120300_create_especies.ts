import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('especies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('nome').notNullable().unique();
    table.text('produto').notNullable();
    table.text('unidade_produto').notNullable();
    table.decimal('consumo_racao_por_animal', 10, 4).notNullable();
    table.decimal('producao_por_animal', 10, 4).notNullable();
    table.decimal('preco_base', 10, 2).notNullable();
    table.decimal('taxa_crescimento', 10, 4).notNullable().defaultTo(0);
    table.boolean('ativo').notNullable().defaultTo(true);

    table.index('produto');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('especies');
}
