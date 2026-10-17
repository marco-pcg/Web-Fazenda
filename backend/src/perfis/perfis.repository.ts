import { Injectable } from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { FilterPerfilDto } from './dto/filter-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { database as knex } from '../db/knex-connection';

@Injectable()
export class PerfisRepository {
  private readonly table = 'perfis';
  private readonly pivotTable = 'perfil_permissao';

  async findByNome(nome: string) {
    return knex(this.table)
      .where({ nome })
      .first();
  }

  async findByName(name: string) {
    return this.findByNome(name);
  }

  async create(perfil: any) {
    return knex(this.table)
      .insert(perfil)
      .returning(['*']);
  }

  async findAll(filtros: FilterPerfilDto) {
    const query = knex(this.table);

    if (filtros.nome) {
      query.where('nome', 'ilike', `%${filtros.nome}%`);
    }

    if (filtros.ativo !== undefined) {
      query.where({ ativo: filtros.ativo });
    }

    if (filtros.search) {
      query.where('nome', 'ilike', `%${filtros.search}%`);
    }

    const countResult = await query.clone().count('id as total').first();
    const total = Number(countResult?.total || 0);

    const page = Number(filtros.page) || 1;
    const limit = Number(filtros.limit) || 10;
    const offset = (page - 1) * limit;

    const dados = await query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('nome');

    return {
      dados,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string) {
    return knex(this.table)
      .where({ id })
      .first();
  }

  async vincularPermissoes(perfil_id: string, permissoes_ids: string[]) {
    await knex.transaction(async (trx) => {
      await trx(this.pivotTable)
        .where({ perfil_id })
        .del();

      if (permissoes_ids && permissoes_ids.length > 0) {
        const newVinculos = permissoes_ids.map((id) => ({
          perfil_id,
          permissao_id: id,
        }));

        await trx(this.pivotTable).insert(newVinculos);
      }
    });
  }

  async update(id: string, updatePerfilDto: UpdatePerfilDto) {
    return knex(this.table)
      .where({ id })
      .update({
        ...updatePerfilDto,
        updated_at: knex.fn.now(),
      })
      .returning(['*']);
  }

  async remove(id: string) {
    return knex(this.table)
      .where({ id })
      .del();
  }

  async findPermissoesByPerfilId(id: string) {
    return knex('permissoes')
      .join(this.pivotTable, 'permissoes.id', '=', `${this.pivotTable}.permissao_id`)
      .select([
        'permissoes.id',
        'permissoes.nome',
        'permissoes.descricao',
        'permissoes.modulo',
        'permissoes.acao',
      ])
      .where(`${this.pivotTable}.perfil_id`, id);
  }

  async findPermissoesById(id: string) {
    return this.findPermissoesByPerfilId(id);
  }
}
