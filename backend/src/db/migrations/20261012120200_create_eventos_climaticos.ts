import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('eventos_climaticos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('temporada_id')
      .notNullable()
      .references('id')
      .inTable('temporadas');
    table.uuid('turma_id').notNullable();
    table
      .text('tipo')
      .notNullable()
      .checkIn(['SECA', 'CHUVA_FORTE', 'GEADA', 'ONDA_CALOR', 'BOA_SAFRA']);
    table.text('alvo').notNullable().checkIn(['AGUA', 'PRODUTIVIDADE']);
    table.decimal('multiplicador', 10, 4).notNullable();
    table.text('descricao');
    table
      .text('status')
      .notNullable()
      .defaultTo('ATIVO')
      .checkIn(['ATIVO', 'ENCERRADO']);
    table.uuid('criado_por').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('turma_id');
    table.index('status');
    table.index('tipo');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('eventos_climaticos');
}
