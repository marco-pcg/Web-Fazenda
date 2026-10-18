import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('temporadas', (table) => {
    table
      .foreign('turma_id', 'temporadas_turma_id_fk')
      .references('id')
      .inTable('turmas')
      .onDelete('CASCADE');
  });

  await knex.schema.alterTable('eventos_climaticos', (table) => {
    table.dropForeign(['temporada_id']);
    table
      .foreign('temporada_id', 'eventos_climaticos_temporada_id_fk')
      .references('id')
      .inTable('temporadas')
      .onDelete('CASCADE');
    table
      .foreign('turma_id', 'eventos_climaticos_turma_id_fk')
      .references('id')
      .inTable('turmas')
      .onDelete('CASCADE');
    table.uuid('criado_por').nullable().alter();
    table
      .foreign('criado_por', 'eventos_climaticos_criado_por_fk')
      .references('id')
      .inTable('usuarios')
      .onDelete('SET NULL');
  });

  await knex.schema.alterTable('rebanhos', (table) => {
    table
      .foreign('fazenda_id', 'rebanhos_fazenda_id_fk')
      .references('id')
      .inTable('fazendas')
      .onDelete('CASCADE');
  });

  await knex.schema.alterTable('alimentacoes', (table) => {
    table.dropForeign(['temporada_id']);
    table
      .foreign('temporada_id', 'alimentacoes_temporada_id_fk')
      .references('id')
      .inTable('temporadas')
      .onDelete('SET NULL');
  });

  await knex.schema.alterTable('producoes', (table) => {
    table.dropForeign(['temporada_id']);
    table
      .foreign('temporada_id', 'producoes_temporada_id_fk')
      .references('id')
      .inTable('temporadas')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('producoes', (table) => {
    table.dropForeign('temporada_id', 'producoes_temporada_id_fk');
    table.foreign('temporada_id').references('id').inTable('temporadas');
  });

  await knex.schema.alterTable('alimentacoes', (table) => {
    table.dropForeign('temporada_id', 'alimentacoes_temporada_id_fk');
    table.foreign('temporada_id').references('id').inTable('temporadas');
  });

  await knex.schema.alterTable('rebanhos', (table) => {
    table.dropForeign('fazenda_id', 'rebanhos_fazenda_id_fk');
  });

  await knex.schema.alterTable('eventos_climaticos', (table) => {
    table.dropForeign('criado_por', 'eventos_climaticos_criado_por_fk');
    table.uuid('criado_por').notNullable().alter();
    table.dropForeign('turma_id', 'eventos_climaticos_turma_id_fk');
    table.dropForeign('temporada_id', 'eventos_climaticos_temporada_id_fk');
    table.foreign('temporada_id').references('id').inTable('temporadas');
  });

  await knex.schema.alterTable('temporadas', (table) => {
    table.dropForeign('turma_id', 'temporadas_turma_id_fk');
  });
}
