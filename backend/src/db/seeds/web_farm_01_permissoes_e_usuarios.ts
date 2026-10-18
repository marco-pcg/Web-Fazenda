import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  const permissoesDef = [
    { nome: 'culturas:listar', descricao: 'Listar culturas', modulo: 'culturas', acao: 'listar' },
    { nome: 'culturas:visualizar', descricao: 'Visualizar uma cultura', modulo: 'culturas', acao: 'visualizar' },
    { nome: 'culturas:criar', descricao: 'Cadastrar culturas', modulo: 'culturas', acao: 'criar' },
    { nome: 'culturas:editar', descricao: 'Editar culturas', modulo: 'culturas', acao: 'editar' },
    { nome: 'culturas:deletar', descricao: 'Excluir culturas', modulo: 'culturas', acao: 'deletar' },

    { nome: 'fazendas:listar', descricao: 'Listar fazendas', modulo: 'fazendas', acao: 'listar' },
    { nome: 'fazendas:visualizar', descricao: 'Visualizar uma fazenda', modulo: 'fazendas', acao: 'visualizar' },
    { nome: 'fazendas:criar', descricao: 'Cadastrar fazendas', modulo: 'fazendas', acao: 'criar' },
    { nome: 'fazendas:editar', descricao: 'Editar fazendas', modulo: 'fazendas', acao: 'editar' },
    { nome: 'fazendas:deletar', descricao: 'Excluir fazendas', modulo: 'fazendas', acao: 'deletar' },

    { nome: 'talhoes:listar', descricao: 'Listar talhões', modulo: 'talhoes', acao: 'listar' },
    { nome: 'talhoes:visualizar', descricao: 'Visualizar um talhão', modulo: 'talhoes', acao: 'visualizar' },
    { nome: 'talhoes:criar', descricao: 'Cadastrar talhões', modulo: 'talhoes', acao: 'criar' },
    { nome: 'talhoes:editar', descricao: 'Editar talhões', modulo: 'talhoes', acao: 'editar' },
    { nome: 'talhoes:deletar', descricao: 'Excluir talhões', modulo: 'talhoes', acao: 'deletar' },

    { nome: 'plantios:listar', descricao: 'Listar plantios', modulo: 'plantios', acao: 'listar' },
    { nome: 'plantios:visualizar', descricao: 'Visualizar um plantio', modulo: 'plantios', acao: 'visualizar' },
    { nome: 'plantios:criar', descricao: 'Plantar em um talhão', modulo: 'plantios', acao: 'criar' },
    { nome: 'plantios:colher', descricao: 'Colher um plantio', modulo: 'plantios', acao: 'colher' },

    { nome: 'colheitas:listar', descricao: 'Listar colheitas', modulo: 'colheitas', acao: 'listar' },
    { nome: 'colheitas:visualizar', descricao: 'Visualizar uma colheita', modulo: 'colheitas', acao: 'visualizar' },
  ];

  const permissoesComId = permissoesDef.map((p) => ({
    id: randomUUID(),
    ...p,
  }));

  await knex('permissoes')
    .whereIn('modulo', ['culturas', 'fazendas', 'talhoes', 'plantios', 'colheitas'])
    .del();
  await knex('permissoes').insert(permissoesComId);

  const admin = await knex('perfis').where({ nome: 'admin' }).first();
  const professor = await knex('perfis').where({ nome: 'professor' }).first();
  const aluno = await knex('perfis').where({ nome: 'aluno' }).first();

  const professorPerms = [
    'culturas:listar', 'culturas:visualizar', 'culturas:criar', 'culturas:editar', 'culturas:deletar',
    'fazendas:listar', 'fazendas:visualizar', 'fazendas:criar', 'fazendas:editar', 'fazendas:deletar',
    'talhoes:listar', 'talhoes:visualizar', 'talhoes:criar', 'talhoes:editar', 'talhoes:deletar',
    'plantios:listar', 'plantios:visualizar',
    'colheitas:listar', 'colheitas:visualizar',
  ];

  const alunoPerms = [
    'culturas:listar', 'culturas:visualizar',
    'fazendas:listar', 'fazendas:visualizar',
    'talhoes:listar', 'talhoes:visualizar',
    'plantios:listar', 'plantios:visualizar', 'plantios:criar', 'plantios:colher',
    'colheitas:listar', 'colheitas:visualizar',
  ];

  const vinculos: { perfil_id: string; permissao_id: string }[] = [];

  for (const perm of permissoesComId) {
    vinculos.push({ perfil_id: admin.id, permissao_id: perm.id });

    if (professorPerms.includes(perm.nome)) {
      vinculos.push({ perfil_id: professor.id, permissao_id: perm.id });
    }

    if (alunoPerms.includes(perm.nome)) {
      vinculos.push({ perfil_id: aluno.id, permissao_id: perm.id });
    }
  }

  await knex('perfil_permissao').insert(vinculos);

  const turmaId = 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5';
  const professorId = 'fe2e7819-c524-4e90-a4b5-4f1f86044dfb';
  const anaId = '087bfe24-cdeb-4e99-a2e8-a11d968bb17c';
  const brunoId = '72dad241-28b9-4a6f-ac81-528e80dfd2d0';

  await knex('usuarios').whereIn('id', [professorId, anaId, brunoId]).del();
  await knex('turmas').where({ id: turmaId }).del();

  const senha = await bcrypt.hash('123456', 10);

  await knex('usuarios').insert({
    id: professorId,
    nome: 'Professor Web-Farm',
    email: 'professor@webfarm.com',
    senha,
    perfil_id: professor.id,
  });

  await knex('turmas').insert({
    id: turmaId,
    codigo: 'WF01',
    nome: 'Programação Web',
    ano: 2026,
    professor_id: professorId,
  });

  await knex('usuarios').insert([
    { id: anaId, nome: 'Ana', email: 'ana@webfarm.com', senha, perfil_id: aluno.id, turma_id: turmaId },
    { id: brunoId, nome: 'Bruno', email: 'bruno@webfarm.com', senha, perfil_id: aluno.id, turma_id: turmaId },
  ]);

  await knex('turma_alunos').insert([
    { turma_id: turmaId, aluno_id: anaId },
    { turma_id: turmaId, aluno_id: brunoId },
  ]);
}
