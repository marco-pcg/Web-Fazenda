import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const permissoesDef = [
    { nome: 'LISTAR_CULTURAS', descricao: 'Listar culturas', modulo: 'culturas', acao: 'listar' },
    { nome: 'BUSCAR_CULTURA', descricao: 'Visualizar uma cultura', modulo: 'culturas', acao: 'visualizar' },
    { nome: 'CRIAR_CULTURA', descricao: 'Cadastrar culturas', modulo: 'culturas', acao: 'criar' },
    { nome: 'EDITAR_CULTURA', descricao: 'Editar culturas', modulo: 'culturas', acao: 'editar' },
    { nome: 'DELETAR_CULTURA', descricao: 'Excluir culturas', modulo: 'culturas', acao: 'deletar' },

    { nome: 'LISTAR_FAZENDAS', descricao: 'Listar fazendas', modulo: 'fazendas', acao: 'listar' },
    { nome: 'BUSCAR_FAZENDA', descricao: 'Visualizar uma fazenda', modulo: 'fazendas', acao: 'visualizar' },
    { nome: 'CRIAR_FAZENDA', descricao: 'Cadastrar fazendas', modulo: 'fazendas', acao: 'criar' },
    { nome: 'EDITAR_FAZENDA', descricao: 'Editar fazendas', modulo: 'fazendas', acao: 'editar' },
    { nome: 'DELETAR_FAZENDA', descricao: 'Excluir fazendas', modulo: 'fazendas', acao: 'deletar' },

    { nome: 'LISTAR_TALHOES', descricao: 'Listar talhões', modulo: 'talhoes', acao: 'listar' },
    { nome: 'BUSCAR_TALHAO', descricao: 'Visualizar um talhão', modulo: 'talhoes', acao: 'visualizar' },
    { nome: 'CRIAR_TALHAO', descricao: 'Cadastrar talhões', modulo: 'talhoes', acao: 'criar' },
    { nome: 'EDITAR_TALHAO', descricao: 'Editar talhões', modulo: 'talhoes', acao: 'editar' },
    { nome: 'DELETAR_TALHAO', descricao: 'Excluir talhões', modulo: 'talhoes', acao: 'deletar' },

    { nome: 'LISTAR_PLANTIOS', descricao: 'Listar plantios', modulo: 'plantios', acao: 'listar' },
    { nome: 'BUSCAR_PLANTIO', descricao: 'Visualizar um plantio', modulo: 'plantios', acao: 'visualizar' },
    { nome: 'CRIAR_PLANTIO', descricao: 'Plantar em um talhão', modulo: 'plantios', acao: 'criar' },
    { nome: 'COLHER_PLANTIO', descricao: 'Colher um plantio', modulo: 'plantios', acao: 'colher' },

    { nome: 'LISTAR_COLHEITAS', descricao: 'Listar colheitas', modulo: 'colheitas', acao: 'listar' },
    { nome: 'BUSCAR_COLHEITA', descricao: 'Visualizar uma colheita', modulo: 'colheitas', acao: 'visualizar' },
  ];

  const professorPerms = [
    'LISTAR_CULTURAS', 'BUSCAR_CULTURA', 'CRIAR_CULTURA', 'EDITAR_CULTURA', 'DELETAR_CULTURA',
    'LISTAR_FAZENDAS', 'BUSCAR_FAZENDA', 'CRIAR_FAZENDA', 'EDITAR_FAZENDA', 'DELETAR_FAZENDA',
    'LISTAR_TALHOES', 'BUSCAR_TALHAO', 'CRIAR_TALHAO', 'EDITAR_TALHAO', 'DELETAR_TALHAO',
    'LISTAR_PLANTIOS', 'BUSCAR_PLANTIO',
    'LISTAR_COLHEITAS', 'BUSCAR_COLHEITA',
  ];

  const alunoPerms = [
    'LISTAR_CULTURAS', 'BUSCAR_CULTURA',
    'LISTAR_FAZENDAS', 'BUSCAR_FAZENDA',
    'LISTAR_TALHOES', 'BUSCAR_TALHAO',
    'LISTAR_PLANTIOS', 'BUSCAR_PLANTIO', 'CRIAR_PLANTIO', 'COLHER_PLANTIO',
    'LISTAR_COLHEITAS', 'BUSCAR_COLHEITA',
  ];

  const modulos = ['culturas', 'fazendas', 'talhoes', 'plantios', 'colheitas'];
  for (const modulo of modulos) {
    await knex('permissoes').where({ modulo }).del();
  }

  const permissoes = await knex('permissoes')
    .insert(permissoesDef)
    .returning(['id', 'nome']);

  const admin = await knex('perfis').where({ nome: 'admin' }).first();
  const professor = await knex('perfis').where({ nome: 'professor' }).first();
  const aluno = await knex('perfis').where({ nome: 'aluno' }).first();

  const vinculos: { perfilId: string; permissaoId: string }[] = [];

  for (const perm of permissoes) {
    if (admin) {
      vinculos.push({ perfilId: admin.id, permissaoId: perm.id });
    }
    if (professor && professorPerms.includes(perm.nome)) {
      vinculos.push({ perfilId: professor.id, permissaoId: perm.id });
    }
    if (aluno && alunoPerms.includes(perm.nome)) {
      vinculos.push({ perfilId: aluno.id, permissaoId: perm.id });
    }
  }

  if (vinculos.length > 0) {
    await knex('perfis_permissoes').insert(vinculos);
  }
}
