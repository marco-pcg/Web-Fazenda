import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('estoques', (table) => {
    table
      .uuid('fazendaId')
      .primary()
      .references('id')
      .inTable('fazendas')
      .onDelete('CASCADE');
    table.float('racao').notNullable().defaultTo(0);
    table.jsonb('produtos').notNullable().defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('produtos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 80).notNullable().unique();
    table.string('unidade', 20).notNullable();
    table.string('chaveEstoque', 120).notNullable().unique();
    table.decimal('precoBase', 14, 2).notNullable();
    table.decimal('sensibilidade', 12, 6).notNullable().defaultTo(0);
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('cotacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('produtoId').notNullable().references('id').inTable('produtos');
    table.uuid('turmaId').notNullable().references('id').inTable('turmas');
    table.integer('temporada').notNullable();
    table.float('quantidadeVendida').notNullable().defaultTo(0);
    table.decimal('precoAtual', 14, 2).notNullable();
    table.unique(['produtoId', 'turmaId', 'temporada']);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('vendas_conjuntas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('produtoId').notNullable().references('id').inTable('produtos');
    table.uuid('turmaId').notNullable().references('id').inTable('turmas');
    table.uuid('criadorId').notNullable().references('id').inTable('usuarios');
    table.integer('temporada').notNullable();
    table.string('status', 30).notNullable().defaultTo('ABERTA');
    table.decimal('valorBruto', 14, 2);
    table.decimal('taxa', 14, 2);
    table.decimal('valorLiquido', 14, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('ordens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('tipo', 10).notNullable();
    table.string('modalidade', 15).notNullable();
    table.string('status', 15).notNullable().defaultTo('ABERTA');
    table.uuid('produtoId').notNullable().references('id').inTable('produtos');
    table.uuid('usuarioId').notNullable().references('id').inTable('usuarios');
    table.uuid('fazendaId').references('id').inTable('fazendas');
    table.uuid('vendaConjuntaId').references('id').inTable('vendas_conjuntas');
    table.uuid('ordemOrigemId').references('id').inTable('ordens');
    table.integer('temporada');
    table.float('quantidade').notNullable();
    table.decimal('precoUnitario', 14, 2);
    table.decimal('valorTotal', 14, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('transacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('tipo', 25).notNullable();
    table.uuid('ordemId').references('id').inTable('ordens');
    table.uuid('vendaConjuntaId').references('id').inTable('vendas_conjuntas');
    table.uuid('compradorId').references('id').inTable('usuarios');
    table.uuid('beneficiarioId').references('id').inTable('usuarios');
    table.uuid('fazendaId').references('id').inTable('fazendas');
    table.decimal('valor', 14, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transacoes');
  await knex.schema.dropTableIfExists('ordens');
  await knex.schema.dropTableIfExists('vendas_conjuntas');
  await knex.schema.dropTableIfExists('cotacoes');
  await knex.schema.dropTableIfExists('produtos');
  await knex.schema.dropTableIfExists('estoques');
}
