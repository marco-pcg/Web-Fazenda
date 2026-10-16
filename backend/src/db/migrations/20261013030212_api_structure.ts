import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('perfis', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome').unique().notNullable();
    table.boolean('ativo').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('permissoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome').unique().notNullable();
    table.string('descricao').notNullable();
    table.string('modulo').notNullable();
    table.string('acao').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('perfil_permissao', (table) => {
    table.uuid('perfil_id').references('id').inTable('perfis').onDelete('CASCADE');
    table.uuid('permissao_id').references('id').inTable('permissoes').onDelete('CASCADE');
    table.primary(['perfil_id', 'permissao_id']);
  });

  await knex.schema.createTable('turmas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('codigo', 4).unique().notNullable();
    table.string('nome').notNullable();
    table.integer('ano').notNullable();
    table.integer('max_alunos').defaultTo(40);
    table.uuid('professor_id').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('usuarios', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('senha').notNullable();
    table.uuid('perfil_id').references('id').inTable('perfis').onDelete('RESTRICT');
    table.uuid('turma_id').references('id').inTable('turmas').onDelete('SET NULL').nullable();
    table.timestamps(true, true);
  });
  await knex.schema.alterTable('turmas', (table) => {
    table.foreign('professor_id').references('id').inTable('usuarios').onDelete('SET NULL');
  });

  await knex.schema.createTable('turma_alunos', (table) => {
    table.uuid('turma_id').references('id').inTable('turmas').onDelete('CASCADE');
    table.uuid('aluno_id').references('id').inTable('usuarios').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.primary(['turma_id', 'aluno_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('turma_alunos');

  await knex.schema.alterTable('turmas', (table) => {
    table.dropForeign(['professor_id']);
  });

  await knex.schema.dropTableIfExists('usuarios');
  await knex.schema.dropTableIfExists('turmas');
  await knex.schema.dropTableIfExists('perfil_permissao');
  await knex.schema.dropTableIfExists('permissoes');
  await knex.schema.dropTableIfExists('perfis');
}