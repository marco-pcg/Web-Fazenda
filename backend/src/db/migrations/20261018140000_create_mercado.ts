import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('produtos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 80).notNullable().unique();
    table.string('unidade', 20).notNullable();
    table.string('chave_estoque', 120).notNullable().unique();
    table.decimal('preco_base', 14, 2).notNullable();
    table.decimal('sensibilidade', 12, 6).notNullable().defaultTo(0);
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('cotacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('produto_id').notNullable().references('id').inTable('produtos');
    table.uuid('turma_id').notNullable().references('id').inTable('turmas');
    table.integer('temporada').notNullable();
    table.decimal('quantidade_vendida', 16, 4).notNullable().defaultTo(0);
    table.decimal('preco_atual', 14, 2).notNullable();
    table.unique(['produto_id', 'turma_id', 'temporada']);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('vendas_conjuntas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('produto_id').notNullable().references('id').inTable('produtos');
    table.uuid('turma_id').notNullable().references('id').inTable('turmas');
    table
      .uuid('criador_usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios');
    table.integer('temporada').notNullable();
    table.string('status', 30).notNullable().defaultTo('ABERTA');
    table.decimal('valor_bruto', 14, 2);
    table.decimal('taxa', 14, 2);
    table.decimal('valor_liquido', 14, 2);
    table.timestamps(true, true);
    table.index(['produto_id', 'status']);
  });

  await knex.schema.createTable('ordens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('tipo', 10).notNullable();
    table.string('modalidade', 15).notNullable();
    table.string('status', 15).notNullable().defaultTo('ABERTA');
    table.uuid('produto_id').notNullable().references('id').inTable('produtos');
    table.uuid('usuario_id').notNullable().references('id').inTable('usuarios');
    table.uuid('fazenda_id').references('id').inTable('fazendas');
    table
      .uuid('venda_conjunta_id')
      .references('id')
      .inTable('vendas_conjuntas');
    table.uuid('ordem_origem_id').references('id').inTable('ordens');
    table.integer('temporada');
    table.decimal('quantidade', 16, 4).notNullable();
    table.decimal('preco_unitario', 14, 2);
    table.decimal('valor_total', 14, 2);
    table.timestamps(true, true);
    table.index(['tipo', 'status']);
    table.index(['venda_conjunta_id', 'status']);
  });

  await knex.schema.createTable('transacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('tipo', 25).notNullable();
    table.uuid('ordem_id').references('id').inTable('ordens');
    table
      .uuid('venda_conjunta_id')
      .references('id')
      .inTable('vendas_conjuntas');
    table.uuid('comprador_usuario_id').references('id').inTable('usuarios');
    table.uuid('beneficiario_usuario_id').references('id').inTable('usuarios');
    table.uuid('fazenda_id').references('id').inTable('fazendas');
    table.decimal('valor', 14, 2).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['tipo', 'created_at']);
    table.index('venda_conjunta_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transacoes');
  await knex.schema.dropTableIfExists('ordens');
  await knex.schema.dropTableIfExists('vendas_conjuntas');
  await knex.schema.dropTableIfExists('cotacoes');
  await knex.schema.dropTableIfExists('produtos');
}
