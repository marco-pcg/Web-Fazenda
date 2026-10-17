import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('culturas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('nome', 60).notNullable().unique();
    table.specificType('estacoes', 'text[]').notNullable();
    table.integer('area_por_unidade').notNullable();
    table.integer('agua_por_unidade').notNullable();
    table.integer('dias_crescimento').notNullable();
    table.float('rendimento_por_unidade').notNullable();
    table.float('valor_por_unidade').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('culturas');
}
