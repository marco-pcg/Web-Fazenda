import { Injectable } from '@nestjs/common';
import { FilterPermissaoDto } from './dto/filter-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { database as knex } from '../db/knex-connection';
import { CreatePermissaoDto } from './dto/create-permissao.dto';

@Injectable()
export class PermissoesRepository {
    private readonly table = 'permissoes';

    async findByName(name: string) {
        return knex(this.table)
            .where({ name })
            .first()
            .returning(['id', 'nome', 'descricao', 'modulo', 'acao']);
    }

    async create(createPermissaoDto: CreatePermissaoDto) {
        const [permissao] = await knex(this.table)
            .insert(createPermissaoDto)
            .returning(['id', 'nome', 'descricao', 'modulo', 'acao']);
        return permissao;
    }

    async findAll(filtros: FilterPermissaoDto) {
        const query = knex(this.table).select('*');

        if (filtros.modulo) {
            query.where('modulo', 'ilike', `%${filtros.modulo}%`);
        }
        if (filtros.acao) {
            query.where('acao', 'ilike', `%${filtros.acao}%`)
        }

        return query;
    }

    async findById(id: string) {
        return knex(this.table)
            .where({ id })
            .first();
    }

    async update(id: string, updatePermissaoDto: UpdatePermissaoDto) {
        const [permissao] = await knex(this.table)
            .where({ id })
            .update({
                ...updatePermissaoDto,
                updated_at: knex.fn.now()
            })
            .returning(['id', 'nome', 'descricao', 'modulo', 'acao']);
        return permissao;
    }

    async remove(id: string) {
        return knex(this.table)
            .where({ id })
            .del();
    }
}