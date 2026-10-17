import type { Knex } from 'knex';

export interface Paginado<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function paginar<T>(
  query: Knex.QueryBuilder,
  page = 1,
  limit = 20,
): Promise<Paginado<T>> {
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const contagem = (await query
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as total')
    .first()) as { total: string } | undefined;
  const total = Number(contagem?.total || 0);

  const data = (await query
    .clone()
    .limit(limit)
    .offset((page - 1) * limit)) as T[];

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
