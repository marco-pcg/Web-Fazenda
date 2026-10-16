import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

export async function seed(knex: Knex): Promise<void> {
  await knex('turma_alunos').del();
  await knex('usuarios').del();
  await knex('turmas').del();
  await knex('perfil_permissao').del();
  await knex('permissoes').del();
  await knex('perfis').del();

  const adminPerfilId = process.env.ADMIN_PERFIL_ID || randomUUID();
  const professorPerfilId = process.env.PROF_PERFIL_ID || randomUUID();
  const alunoPerfilId = process.env.ALUNO_PERFIL_ID || randomUUID();

  await knex('perfis').insert([
    { id: adminPerfilId, nome: 'admin', ativo: true },
    { id: professorPerfilId, nome: 'professor', ativo: true },
    { id: alunoPerfilId, nome: 'aluno', ativo: true },
  ]);

  const permissoesDef = [
    {
      nome: 'usuarios:listar',
      descricao: 'Listar usuários cadastrados',
      modulo: 'usuarios',
      acao: 'listar',
    },
    {
      nome: 'usuarios:visualizar',
      descricao: 'Visualizar dados de um usuário',
      modulo: 'usuarios',
      acao: 'visualizar',
    },
    {
      nome: 'usuarios:criar',
      descricao: 'Cadastrar novos usuários',
      modulo: 'usuarios',
      acao: 'criar',
    },
    {
      nome: 'usuarios:editar',
      descricao: 'Editar dados de usuários',
      modulo: 'usuarios',
      acao: 'editar',
    },
    {
      nome: 'usuarios:deletar',
      descricao: 'Excluir usuários',
      modulo: 'usuarios',
      acao: 'deletar',
    },

    {
      nome: 'perfis:listar',
      descricao: 'Listar perfis do sistema',
      modulo: 'perfis',
      acao: 'listar',
    },
    {
      nome: 'perfis:visualizar',
      descricao: 'Visualizar dados de um perfil',
      modulo: 'perfis',
      acao: 'visualizar',
    },
    {
      nome: 'perfis:criar',
      descricao: 'Criar novos perfis',
      modulo: 'perfis',
      acao: 'criar',
    },
    {
      nome: 'perfis:editar',
      descricao: 'Editar perfis e vincular permissões',
      modulo: 'perfis',
      acao: 'editar',
    },
    {
      nome: 'perfis:deletar',
      descricao: 'Excluir perfis',
      modulo: 'perfis',
      acao: 'deletar',
    },

    {
      nome: 'permissoes:listar',
      descricao: 'Listar permissões do sistema',
      modulo: 'permissoes',
      acao: 'listar',
    },
    {
      nome: 'permissoes:visualizar',
      descricao: 'Visualizar dados de uma permissão',
      modulo: 'permissoes',
      acao: 'visualizar',
    },
    {
      nome: 'permissoes:criar',
      descricao: 'Criar novas permissões',
      modulo: 'permissoes',
      acao: 'criar',
    },
    {
      nome: 'permissoes:editar',
      descricao: 'Editar permissões',
      modulo: 'permissoes',
      acao: 'editar',
    },
    {
      nome: 'permissoes:deletar',
      descricao: 'Excluir permissões',
      modulo: 'permissoes',
      acao: 'deletar',
    },

    {
      nome: 'turmas:listar',
      descricao: 'Listar turmas cadastradas',
      modulo: 'turmas',
      acao: 'listar',
    },
    {
      nome: 'turmas:visualizar',
      descricao: 'Visualizar detalhes de uma turma',
      modulo: 'turmas',
      acao: 'visualizar',
    },
    {
      nome: 'turmas:criar',
      descricao: 'Cadastrar novas turmas',
      modulo: 'turmas',
      acao: 'criar',
    },
    {
      nome: 'turmas:editar',
      descricao: 'Editar turmas e matricular alunos',
      modulo: 'turmas',
      acao: 'editar',
    },
    {
      nome: 'turmas:deletar',
      descricao: 'Excluir turmas',
      modulo: 'turmas',
      acao: 'deletar',
    },
  ];

  const permissoesComId = permissoesDef.map((p) => ({
    id: randomUUID(),
    ...p,
  }));

  await knex('permissoes').insert(permissoesComId);

  const vinculos: { perfil_id: string; permissao_id: string }[] = [];

  for (const perm of permissoesComId) {
    vinculos.push({ perfil_id: adminPerfilId, permissao_id: perm.id });
  }

  const professorPerms = [
    'turmas:listar',
    'turmas:visualizar',
    'turmas:editar',
    'usuarios:listar',
    'usuarios:visualizar',
  ];
  for (const perm of permissoesComId) {
    if (professorPerms.includes(perm.nome)) {
      vinculos.push({ perfil_id: professorPerfilId, permissao_id: perm.id });
    }
  }

  const alunoPerms = ['turmas:listar', 'turmas:visualizar'];
  for (const perm of permissoesComId) {
    if (alunoPerms.includes(perm.nome)) {
      vinculos.push({ perfil_id: alunoPerfilId, permissao_id: perm.id });
    }
  }

  await knex('perfil_permissao').insert(vinculos);

  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_E_ADR;
  const adminSenha = process.env.ADMIN_PWD;
  if (!adminEmail) {
    throw new Error(
      'O e-mail do administrador precisa ser definido em ADMIN_EMAIL.',
    );
  }
  if (!adminSenha) {
    throw new Error('A senha do administrador precisa ser definida.');
  }
  const adminSenhaHash = await bcrypt.hash(adminSenha, 10);

  await knex('usuarios').insert({
    id: randomUUID(),
    nome: 'Administrador',
    email: adminEmail,
    senha: adminSenhaHash,
    perfil_id: adminPerfilId,
    turma_id: null,
  });
}
