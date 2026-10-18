import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "create unique index temporadas_turma_ativa_unico on temporadas (turma_id) where status = 'ATIVA'",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop index if exists temporadas_turma_ativa_unico');
}
