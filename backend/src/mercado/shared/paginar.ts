import { Knex } from 'knex';

export async function paginar(
  consulta: Knex.QueryBuilder<any, any>,
  pagina = 1,
  limite = 10,
): Promise<{ dados: unknown[]; total: number; page: number; limit: number }> {
  const tamanhoPagina = Math.min(limite, 100);
  const linhasTotais: unknown = await consulta
    .clone()
    .clearSelect()
    .clearOrder()
    .count({ total: '*' });
  const linhas = linhasTotais as Array<{ total: string | number }>;
  const total = Number(linhas[0].total);
  const dados = (await consulta
    .limit(tamanhoPagina)
    .offset((pagina - 1) * tamanhoPagina)) as unknown[];

  return { dados, total, page: pagina, limit: tamanhoPagina };
}
