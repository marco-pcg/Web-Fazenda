import { Injectable } from '@nestjs/common';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { PaginacaoDto } from 'src/common/dtos/paginacao.dto';
import { database as knex } from 'src/db/knex-connection';

@Injectable()
export class PerfisRepository {
    private readonly table = 'perfis';
    private readonly pivotTable = 'perfis_permissoes'

    async findByNome(nome: string) {
        return knex(this.table).where({ nome }).first();
    }

    async create(data: CreatePerfiDto) {
        return knex(this.table).insert(data).returning('*');
    }

    async findAll(filter: PaginacaoDto) {
        const { pagina, limite, search } = filter;

        const limitePorPagina = limite || 10;
        const skip = ((pagina || 1) - 1) * limitePorPagina;

        const query = knex(this.table).select('*');

        if (search) {
            query.where('nome', 'ilike', `%${search}%`);
        }

        const totalQuery = knex(this.table).count('id as total');

        if (search) {
            totalQuery.where('nome', 'ilike', `%${search}%`);
        }
        const [{ total }] = await totalQuery;

        const dados = await query.limit(limitePorPagina).offset(skip).orderBy('id', 'desc');

        return { dados, total: Number(total), pagina: Number(pagina), limite: Number(limite) };
    }

    async findById(id: string) {
        return knex(this.table).where({ id }).first();
    }

    async findPermissoesById(id: string) {
        return knex(this.pivotTable).join('permissoes', 'permissoes.id', `${this.pivotTable}.permissaoId`).where({ perfilId: id }).select('permissoes.id', 'permissoes.nome');
    }

    async vincularPermissoes(perfilId: string, permissoes: string[]) {
        await knex(this.pivotTable).where({ perfilId }).del();
        const inserts = permissoes.map((permissaoId) => ({
            perfilId,
            permissaoId,
        }));
        await knex(this.pivotTable).insert(inserts);
    }
}