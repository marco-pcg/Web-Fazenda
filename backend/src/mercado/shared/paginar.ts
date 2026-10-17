import { Knex } from 'knex';

export async function paginar(
  query: Knex.QueryBuilder<any, any>,
  page = 1,
  limit = 10,
): Promise<{ dados: unknown[]; total: number; page: number; limit: number }> {
  const pageSize = Math.min(limit, 100);
  const totalRows: unknown = await query
    .clone()
    .clearSelect()
    .clearOrder()
    .count({ total: '*' });
  const rows = totalRows as Array<{ total: string | number }>;
  const total = Number(rows[0].total);
  const dados = (await query
    .limit(pageSize)
    .offset((page - 1) * pageSize)) as unknown[];

  return { dados, total, page, limit: pageSize };
}
