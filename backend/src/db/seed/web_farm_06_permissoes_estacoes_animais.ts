import type { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface Registro {
  id: string;
  nome: string;
}

const permissoes = [
  {
    nome: 'estacoes:listar',
    descricao: 'Listar estações do ano',
    modulo: 'estacoes',
    acao: 'listar',
  },
  {
    nome: 'estacoes:criar',
    descricao: 'Cadastrar estações do ano',
    modulo: 'estacoes',
    acao: 'criar',
  },
  {
    nome: 'especies:listar',
    descricao: 'Listar espécies de animais',
    modulo: 'especies',
    acao: 'listar',
  },
  {
    nome: 'especies:criar',
    descricao: 'Cadastrar espécies de animais',
    modulo: 'especies',
    acao: 'criar',
  },
  {
    nome: 'especies:editar',
    descricao: 'Editar espécies de animais',
    modulo: 'especies',
    acao: 'editar',
  },
  {
    nome: 'temporadas:listar',
    descricao: 'Listar temporadas das turmas',
    modulo: 'temporadas',
    acao: 'listar',
  },
  {
    nome: 'temporadas:criar',
    descricao: 'Criar temporadas para uma turma',
    modulo: 'temporadas',
    acao: 'criar',
  },
  {
    nome: 'temporadas:avancar',
    descricao: 'Avançar a temporada de uma turma',
    modulo: 'temporadas',
    acao: 'avancar',
  },
  {
    nome: 'eventos:listar',
    descricao: 'Listar eventos climáticos',
    modulo: 'eventos',
    acao: 'listar',
  },
  {
    nome: 'eventos:criar',
    descricao: 'Disparar eventos climáticos na turma',
    modulo: 'eventos',
    acao: 'criar',
  },
  {
    nome: 'eventos:encerrar',
    descricao: 'Encerrar eventos climáticos',
    modulo: 'eventos',
    acao: 'encerrar',
  },
  {
    nome: 'rebanhos:listar',
    descricao: 'Listar rebanhos das fazendas',
    modulo: 'rebanhos',
    acao: 'listar',
  },
  {
    nome: 'rebanhos:criar',
    descricao: 'Adicionar animais a uma fazenda',
    modulo: 'rebanhos',
    acao: 'criar',
  },
  {
    nome: 'rebanhos:alimentar',
    descricao: 'Alimentar rebanhos com ração do estoque',
    modulo: 'rebanhos',
    acao: 'alimentar',
  },
  {
    nome: 'producoes:listar',
    descricao: 'Listar produções dos rebanhos',
    modulo: 'producoes',
    acao: 'listar',
  },
];

const permissoesPorPerfil: Record<string, string[]> = {
  admin: permissoes.map((permissao) => permissao.nome),
  professor: [
    'estacoes:listar',
    'especies:listar',
    'especies:criar',
    'especies:editar',
    'temporadas:listar',
    'temporadas:criar',
    'temporadas:avancar',
    'eventos:listar',
    'eventos:criar',
    'eventos:encerrar',
    'rebanhos:listar',
    'rebanhos:criar',
    'rebanhos:alimentar',
    'producoes:listar',
  ],
  aluno: [
    'estacoes:listar',
    'especies:listar',
    'temporadas:listar',
    'eventos:listar',
    'rebanhos:listar',
    'rebanhos:criar',
    'rebanhos:alimentar',
    'producoes:listar',
  ],
};

export async function seed(knex: Knex): Promise<void> {
  await knex('permissoes')
    .insert(permissoes.map((permissao) => ({ id: randomUUID(), ...permissao })))
    .onConflict('nome')
    .merge(['descricao', 'modulo', 'acao']);

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

    const vinculos = lista.map((permissao) => ({
      perfilId: perfil.id,
      permissaoId: permissao.id,
    }));

    await knex('perfis_permissoes')
      .insert(vinculos)
      .onConflict(['perfilId', 'permissaoId'])
      .ignore();
  }
}
