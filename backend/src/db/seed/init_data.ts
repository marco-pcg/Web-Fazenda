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

  const adminPerfilId = process.env.ADMIN_PERFIL_ID;
  const professorPerfilId = process.env.PROF_PERFIL_ID;
  const alunoPerfilId = process.env.ALUNO_PERFIL_ID;

  await knex('perfis').insert([
    { id: adminPerfilId, nome: 'admin', ativo: true },
    { id: professorPerfilId, nome: 'professor', ativo: true },
    { id: alunoPerfilId, nome: 'aluno', ativo: true },
  ]);

  const permissoes = [
    {
      nome: 'CRIAR_PERFIL',
      descricao: 'Permite criar novos perfis',
      modulo: 'perfis',
      acao: 'create'
    },
    {
      nome: 'EDITAR_PERFIL',
      descricao: 'Permite editar perfis',
      modulo: 'perfis',
      acao: 'update'
    },
    {
      nome: 'LISTAR_PERFIS',
      descricao: 'Permite listar perfis',
      modulo: 'perfis',
      acao: 'read'
    },
    {
      nome: 'BUSCAR_PERFIL',
      descricao: 'Permite buscar um perfil',
      modulo: 'perfis',
      acao: 'read'
    },
    {
      nome: 'LISTAR_PERMISSOES',
      descricao: 'Permite listar permissões',
      modulo: 'permissoes',
      acao: 'read'
    },
    {
      nome: 'CRIAR_TURMA',
      descricao: 'Permite criar turmas',
      modulo: 'turmas',
      acao: 'create'
    },
    {
      nome: 'EDITAR_TURMA',
      descricao: 'Permite editar turmas',
      modulo: 'turmas',
      acao: 'update'
    },
    {
      nome: 'LISTAR_TURMAS',
      descricao: 'Permite listar turmas',
      modulo: 'turmas',
      acao: 'read'
    },
    {
      nome: 'CRIAR_USUARIO',
      descricao: 'Permite criar usuários',
      modulo: 'usuarios',
      acao: 'create'
    },
    {
      nome: 'EDITAR_USUARIO',
      descricao: 'Permite editar usuários',
      modulo: 'usuarios',
      acao: 'update'
    },
    {
      nome: 'LISTAR_USUARIOS',
      descricao: 'Permite listar usuários',
      modulo: 'usuarios',
      acao: 'read'
    },
    {
      nome: 'BUSCAR_USUARIO',
      descricao: 'Permite buscar um usuário',
      modulo: 'usuarios',
      acao: 'read'
    },
    {
      nome: 'DELETAR_USUARIO',
      descricao: 'Permite deletar usuários',
      modulo: 'usuarios',
      acao: 'delete'
    }
  ];

  const permissoesComId = permissoes.map((p) => ({
    id: randomUUID(),
    ...p,
  }));

  await knex('permissoes').insert(permissoesComId);

  const vinculos: { perfilId: string | undefined; permissoesId: string }[] = [];

  for (const perm of permissoesComId) {
    vinculos.push({ perfilId: adminPerfilId, permissoesId: perm.id });
  }

  const professorPerms = [
    'LISTAR_TURMAS',
    'BUSCAR_TURMA',
    'EDITAR_TURMA',
    'LISTAR_USUARIOS',
    'BUSCAR_USUARIO',
  ];
  for (const perm of permissoesComId) {
    if (professorPerms.includes(perm.nome)) {
      vinculos.push({ perfilId: professorPerfilId, permissoesId: perm.id });
    }
  }

  const alunoPerms = ['LISTAR_TURMAS', 'BUSCAR_TURMA'];
  for (const perm of permissoesComId) {
    if (alunoPerms.includes(perm.nome)) {
      vinculos.push({ perfilId: alunoPerfilId, permissoesId: perm.id });
    }
  }

  await knex('perfis_permissoes').insert(vinculos);

  const adminSenha = process.env.ADMIN_PWD;
  if (!adminSenha) {
    throw new Error('A senha do administrador precisa ser definida.');
  }
  const adminSenhaHash = await bcrypt.hash(adminSenha, 10);

  await knex('usuarios').insert({
    id: randomUUID(),
    nome: 'Administrador',
    email: `${process.env.ADMIN_E_ADR}`,
    senha: adminSenhaHash,
    perfil_id: adminPerfilId,
    turma_id: null,
  });
}
