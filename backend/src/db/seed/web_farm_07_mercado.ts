import type { Knex } from 'knex';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

interface Registro {
  id: string;
  nome: string;
}

const permissoes = [
  {
    nome: 'mercado:consultar',
    descricao: 'Consultar produtos, cotações, ordens e vendas conjuntas',
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
    descricao: 'Comprar ofertas avulsas e vendas conjuntas',
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
    descricao: 'Criar vendas conjuntas e alterar contribuições',
    modulo: 'cooperativa',
    acao: 'participar',
  },
  {
    nome: 'cooperativa:distribuir',
    descricao: 'Distribuir o valor das vendas conjuntas',
    modulo: 'cooperativa',
    acao: 'distribuir',
  },
];

const permissoesPorPerfil: Record<string, string[]> = {
  admin: permissoes.map((permissao) => permissao.nome),
  professor: ['mercado:consultar'],
  aluno: [
    'mercado:consultar',
    'mercado:vender',
    'cooperativa:participar',
    'cooperativa:distribuir',
  ],
  comprador: ['mercado:consultar', 'mercado:comprar'],
};

export async function seed(knex: Knex): Promise<void> {
  await knex('permissoes')
    .insert(permissoes.map((permissao) => ({ id: randomUUID(), ...permissao })))
    .onConflict('nome')
    .merge(['descricao', 'modulo', 'acao']);

  const perfilComprador = await knex<Registro>('perfis')
    .where({ nome: 'comprador' })
    .first();
  if (!perfilComprador) {
    await knex('perfis').insert({
      nome: 'comprador',
      descricao: 'Compra produtos no mercado',
    });
  }
  const comprador: Registro = await knex('perfis')
    .where({ nome: 'comprador' })
    .first();

  for (const nomePerfil of Object.keys(permissoesPorPerfil)) {
    const perfil = await knex<Registro>('perfis')
      .where({ nome: nomePerfil })
      .first();
    if (!perfil) {
      continue;
    }

    const lista = await knex<Registro>('permissoes').whereIn(
      'nome',
      permissoesPorPerfil[nomePerfil],
    );

    await knex('perfis_permissoes')
      .insert(
        lista.map((permissao) => ({
          perfilId: perfil.id,
          permissaoId: permissao.id,
        })),
      )
      .onConflict(['perfilId', 'permissaoId'])
      .ignore();
  }

  await knex('usuarios')
    .insert({
      nome: 'Comprador de exemplo',
      email: 'comprador@webfarm.com',
      senha: await bcrypt.hash('comprador123', 10),
      perfilId: comprador.id,
    })
    .onConflict('email')
    .ignore();

  const culturas = await knex('culturas').select(
    'id',
    'nome',
    'valorPorUnidade',
  );
  for (const cultura of culturas) {
    await knex('produtos')
      .insert({
        nome: cultura.nome,
        unidade: 'kg',
        chaveEstoque: 'cultura:' + cultura.id,
        precoBase: cultura.valorPorUnidade,
        sensibilidade: 0.01,
      })
      .onConflict('chaveEstoque')
      .ignore();
  }
}
