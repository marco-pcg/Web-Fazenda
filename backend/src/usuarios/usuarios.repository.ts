import { Injectable } from '@nestjs/common';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { database as knex } from '../db/knex-connection';

@Injectable()
export class UsuariosRepository {
  private readonly table = 'usuarios';

  async findByEmail(email: string): Promise<any> {
    return knex(this.table).where({ email }).first();
  }

  async findById(id: string): Promise<any> {
    return knex(this.table)
      .join('perfis', 'usuarios.perfil_id', '=', 'perfis.id')
      .leftJoin('turmas', 'usuarios.turma_id', '=', 'turmas.id')
      .select([
        'usuarios.id',
        'usuarios.nome',
        'usuarios.email',
        'usuarios.senha',
        'usuarios.perfil_id',
        'perfis.nome as perfil_nome',
        'usuarios.turma_id',
        'turmas.nome as turma_nome',
        'usuarios.created_at',
        'usuarios.updated_at',
      ])
      .where('usuarios.id', id)
      .first();
  }

  async findAllPaginated(
    filtros: FilterUsuarioDto,
    limit: number,
    offset: number,
  ) {
    const query = knex(this.table)
      .join('perfis', 'usuarios.perfil_id', '=', 'perfis.id')
      .leftJoin('turmas', 'usuarios.turma_id', '=', 'turmas.id');

    if (filtros.nome) {
      query.where('usuarios.nome', 'ilike', `%${filtros.nome}%`);
    }

    if (filtros.perfil) {
      query.where('perfis.nome', 'ilike', `%${filtros.perfil}%`);
    }

    if (filtros.search) {
      query.where((builder) => {
        builder
          .where('usuarios.nome', 'ilike', `%${filtros.search}%`)
          .orWhere('usuarios.email', 'ilike', `%${filtros.search}%`);
      });
    }

    const countResult = await query
      .clone()
      .count('usuarios.id as total')
      .first();
    const total = Number(countResult?.total || 0);

    const dados = await query
      .select([
        'usuarios.id',
        'usuarios.nome',
        'usuarios.email',
        'usuarios.perfil_id',
        'perfis.nome as perfil_nome',
        'usuarios.turma_id',
        'turmas.nome as turma_nome',
        'usuarios.created_at',
        'usuarios.updated_at',
      ])
      .limit(limit)
      .offset(offset)
      .orderBy('usuarios.nome', 'asc');

    return { dados, total };
  }

  async create(user: any): Promise<any> {
    return knex(this.table)
      .insert({
        id: user.id,
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        perfil_id: user.perfil_id,
        turma_id: user.turma_id || null,
      })
      .returning([
        'id',
        'nome',
        'email',
        'perfil_id',
        'turma_id',
        'created_at',
        'updated_at',
      ]);
  }

  async update(id: string, user: any): Promise<any> {
    const payload: any = {
      updated_at: knex.fn.now(),
    };

    if (user.nome !== undefined) payload.nome = user.nome;
    if (user.email !== undefined) payload.email = user.email;
    if (user.senha !== undefined) payload.senha = user.senha;
    if (user.perfil_id !== undefined) payload.perfil_id = user.perfil_id;
    if (user.turma_id !== undefined) payload.turma_id = user.turma_id;

    return knex(this.table)
      .where({ id })
      .update(payload)
      .returning([
        'id',
        'nome',
        'email',
        'perfil_id',
        'turma_id',
        'created_at',
        'updated_at',
      ]);
  }

  async remove(id: string) {
    return knex(this.table).where({ id }).del();
  }

  async findForAuth(email: string) {
    return knex(this.table)
      .join('perfis', 'usuarios.perfil_id', '=', 'perfis.id')
      .select(['usuarios.*', 'perfis.nome as perfil_nome'])
      .where('usuarios.email', email)
      .first();
  }
}
