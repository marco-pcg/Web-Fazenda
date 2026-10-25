import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('perfis', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('nome').notNullable();
        table.string('descricao').defaultTo("");
        table.boolean('ativo').defaultTo(true);
        table.timestamps(true, true)
    });

    await knex.schema.createTable('permissoes', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('nome').unique().notNullable();
        table.string('descricao').defaultTo("");
        table.string('modulo').notNullable();
        table.string('acao').notNullable();
        table.timestamps(true, true)
    });

    await knex.schema.createTable('perfis_permissoes', (table) => {
        table.uuid('perfilId').references('id').inTable('perfis').onDelete('CASCADE');
        table.uuid('permissaoId').references('id').inTable('permissoes').onDelete('CASCADE');
        table.primary(['perfilId', 'permissaoId'])
    });

    await knex.schema.createTable('turmas', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('codigoTurma', 4).unique().notNullable();
        table.string('nome').notNullable();
        table.integer('ano').notNullable();
        table.integer('maxAlunos').defaultTo(40);
        table.uuid('professorId').notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('turma-alunos', (table) => {
        table.uuid('turmaId').references('id').inTable('turmas').onDelete('CASCADE');
        table.uuid('alunoId').references('id').inTable('usuarios').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.primary(['turmaId', 'alunoId'])
    });

    await knex.schema.createTable('usuarios', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('nome').notNullable();
        table.string('email').unique().notNullable();
        table.string('senha').notNullable();
        table.uuid('perfilId').references('id').inTable('perfis').onDelete('RESTRICT').nullable();
        table.uuid('turmaId').references('id').inTable('turmas').onDelete('SET NULL').nullable();
        table.timestamps(true, true);
    })
}