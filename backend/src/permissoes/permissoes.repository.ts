import { Injectable } from '@nestjs/common';
import { FilterPermissoesDto } from './dto/filter-permissoes.dto';
import { database as knex } from 'src/db/knex-connection';

@Injectable()
export class PermissoesRepository {
    private readonly table = 'permissoes';

    async findAll(filter: FilterPermissoesDto) {
        const { modulo, acao } = filter;
        const query = knex(this.table).select('*');

        if (modulo) {
            query.where('modulo', 'ilike', `%${modulo}%`);
        }

        if (acao) {
            query.where('acao', 'ilike', `%${acao}%`);
        }

        return query;
    }
}