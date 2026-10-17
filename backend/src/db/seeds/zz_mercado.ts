import type { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

interface Registro {
  id: string;
  nome: string;
}

interface CulturaSeed extends Registro {
  valor_por_unidade: number;
}

interface ColheitaSeed {
  fazenda_id: string;
  cultura_id: string;
  quantidade_colhida: number;
}

interface EstoqueSeed {
  fazenda_id: string;
  produtos: Record<string, number>;
}

export async function seed(knex: Knex): Promise<void> {
  const permissoes = [
    {
      nome: 'mercado:consultar',
      descricao: 'Consultar mercado e cooperativa',
      modulo: 'mercado',
      acao: 'consultar',
    },
    {
      nome: 'mercado:vender',
      descricao: 'Criar e cancelar ofertas avulsas',
      modulo: 'mercado',
      acao: 'vender',
    },
    {
      nome: 'mercado:comprar',
      descricao: 'Comprar ofertas e lotes',
      modulo: 'mercado',
      acao: 'comprar',
    },
    {
      nome: 'produtos:gerenciar',
      descricao: 'Cadastrar e editar produtos',
      modulo: 'produtos',
      acao: 'gerenciar',
    },
    {
      nome: 'cooperativa:participar',
      descricao: 'Criar e alterar contribuições',
      modulo: 'cooperativa',
      acao: 'participar',
    },
    {
      nome: 'cooperativa:distribuir',
      descricao: 'Distribuir vendas conjuntas',
      modulo: 'cooperativa',
      acao: 'distribuir',
    },
  ];
  await knex('permissoes').insert(permissoes).onConflict('nome').ignore();
  await knex('perfis')
    .insert({ nome: 'comprador', ativo: true })
    .onConflict('nome')
    .ignore();

  const perfis = await knex<Registro>('perfis').whereIn('nome', [
    'admin',
    'professor',
    'aluno',
    'comprador',
  ]);
  const permissoesCriadas = await knex<Registro>('permissoes').whereIn(
    'nome',
    permissoes.map((item) => item.nome),
  );
  const regras: Record<string, string[]> = {
    admin: permissoes.map((item) => item.nome),
    professor: ['mercado:consultar'],
    aluno: [
      'mercado:consultar',
      'mercado:vender',
      'cooperativa:participar',
      'cooperativa:distribuir',
    ],
    comprador: ['mercado:consultar', 'mercado:comprar'],
  };
  for (const perfil of perfis) {
    for (const permissao of permissoesCriadas) {
      if (regras[perfil.nome].includes(permissao.nome)) {
        await knex('perfil_permissao')
          .insert({
            perfil_id: perfil.id,
            permissao_id: permissao.id,
          })
          .onConflict(['perfil_id', 'permissao_id'])
          .ignore();
      }
    }
  }

  const comprador = perfis.find((perfil) => perfil.nome === 'comprador');
  if (comprador) {
    await knex('usuarios')
      .insert({
        nome: 'Comprador de exemplo',
        email: 'comprador@webfarm.com',
        senha: await bcrypt.hash('123456', 10),
        perfil_id: comprador.id,
      })
      .onConflict('email')
      .ignore();
  }

  const culturas = await knex<CulturaSeed>('culturas').select(
    'id',
    'nome',
    'valor_por_unidade',
  );
  for (const cultura of culturas) {
    await knex('produtos')
      .insert({
        nome: cultura.nome,
        unidade: 'kg',
        chave_estoque: `cultura:${cultura.id}`,
        preco_base: cultura.valor_por_unidade,
        sensibilidade: 0.01,
      })
      .onConflict('chave_estoque')
      .ignore();
  }

  const registros: unknown = await knex('colheitas as c')
    .join('plantios as p', 'p.id', 'c.plantio_id')
    .join('talhoes as t', 't.id', 'p.talhao_id')
    .select('t.fazenda_id', 'p.cultura_id', 'c.quantidade_colhida');
  const colheitas = registros as ColheitaSeed[];
  for (const colheita of colheitas) {
    const existente = await knex<EstoqueSeed>('estoques')
      .where({ fazenda_id: colheita.fazenda_id })
      .first();
    const produtos = { ...(existente?.produtos || {}) };
    const chave = `cultura:${colheita.cultura_id}`;
    produtos[chave] =
      Number(produtos[chave] || 0) + Number(colheita.quantidade_colhida);
    await knex('estoques')
      .insert({
        fazenda_id: colheita.fazenda_id,
        racao: 0,
        produtos: JSON.stringify(produtos),
      })
      .onConflict('fazenda_id')
      .merge({ produtos: JSON.stringify(produtos) });
  }
}
