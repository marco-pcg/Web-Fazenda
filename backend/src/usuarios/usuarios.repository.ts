import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { database as knex } from 'src/db/knex-connection';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';

@Injectable()
export class UsuariosRepository {
    private readonly table = 'usuarios';

    async findByEmail(email: string) {
        return knex(this.table).where({ email }).first();
    }

    async create(data: CreateUsuarioDto) {
        const [user] = await knex(this.table).insert(data).returning('*');
        return user;
    }

    async findAll(filter: FilterUsuarioDto, limite: number, offset: number) {
        const query = knex(this.table).join('perfis', 'usuarios.perfilId', '=', 'perfis.id').leftJoin('turmas', 'usuarios.turmaId', '=', 'turmas.id').select('*');

        if (filter.nome) {
            query.where('usuarios.nome', 'ilike', `%${filter.nome}%`);
        }

        if (filter.perfil) {
            query.where('perfis.nome', 'ilike', `%${filter.perfil}%`);
        }

        if (filter.search) {
            query.where((builder) => {
                builder.where('usuarios.nome', 'ilike', `%${filter.search}%`).orWhere('usuarios.email', 'ilike', `%${filter.search}%`);
            });
        }

        const countResult = await query.clone().count('usuarios.id as total').first();
        const total = Number(countResult?.total || 0);

        const dados = await query.select([
            "usuarios.id",
            "usuarios.nome",
            "usuarios.email",
            "usuarios.perfilId",
            "perfis.nome as perfil_nome",
            "usuarios.turmaId",
            "turmas.nome as turma_nome",
            "usuarios.created_at",
            "usuarios.updated_at"
        ]).limit(limite).offset(offset).orderBy('usuarios.nome', 'asc');

        return { dados, total };
    }

    async findById(id: string) {
        const usuario = await knex(this.table).where({ id }).first();
        return usuario;
    }

    async update(id: string, data: UpdateUsuarioDto) {
        const [user] = await knex(this.table).where({ id }).update({ ...data, updated_at: knex.fn.now() }).returning('*');
        return user;
    }

    async delete(id: string) {
        await knex(this.table).where({ id }).del();
    }

    async findForAuth(email: string) {
        return knex(this.table).join('perfis', 'usuarios.perfilId', '=', 'perfis.id').select(['usuarios.*', 'perfis.nome as perfil_nome']).where({ 'usuarios.email': email }).first();
    }
}
