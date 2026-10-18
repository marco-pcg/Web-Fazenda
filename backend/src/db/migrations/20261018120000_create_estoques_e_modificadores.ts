import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fazendas', (table) => {
    table.decimal('fator_agua', 10, 4).notNullable().defaultTo(1);
    table.decimal('fator_produtividade', 10, 4).notNullable().defaultTo(1);
  });

  await knex.schema.createTable('estoques', (table) => {
    table.uuid('fazenda_id').primary().references('id').inTable('fazendas').onDelete('CASCADE');
    table.decimal('racao', 14, 4).notNullable().defaultTo(0);
    table.jsonb('produtos').notNullable().defaultTo('{}');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('fazenda_modificadores_climaticos', (table) => {
    table.uuid('fazenda_id').notNullable().references('id').inTable('fazendas').onDelete('CASCADE');
    table.uuid('evento_id').notNullable().references('id').inTable('eventos_climaticos').onDelete('CASCADE');
    table.text('alvo').notNullable().checkIn(['AGUA', 'PRODUTIVIDADE']);
    table.decimal('multiplicador', 10, 4).notNullable();
    table.primary(['fazenda_id', 'evento_id']);
    table.index('evento_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('fazenda_modificadores_climaticos');
  await knex.schema.dropTableIfExists('estoques');
  await knex.schema.alterTable('fazendas', (table) => {
    table.dropColumn('fator_agua');
    table.dropColumn('fator_produtividade');
  });
}
