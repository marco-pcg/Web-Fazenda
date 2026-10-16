import { Injectable } from '@nestjs/common';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { FilterTurmaDto } from './dto/filter-turma.dto';
import { database as knex } from '../db/knex-connection';

@Injectable()
export class TurmasRepository {
  private readonly table = 'turmas';
  private readonly pivotTable = 'turma_alunos';

  async findByCode(codigo: string) {
    return knex(this.table).where({ codigo }).first();
  }

  async create(createTurmaDto: any) {
    return knex(this.table).insert(createTurmaDto).returning('*');
  }

  async findAll(filters: FilterTurmaDto, user: any) {
    const query = knex(this.table)
      .leftJoin('usuarios', 'turmas.professor_id', '=', 'usuarios.id')
      .select([
        'turmas.id',
        'turmas.codigo',
        'turmas.nome',
        'turmas.ano',
        'turmas.max_alunos',
        'turmas.professor_id',
        'usuarios.nome as professor_nome',
        'turmas.created_at',
        'turmas.updated_at',
      ]);

    if (user?.perfil === 'professor') {
      query.where('turmas.professor_id', user.id);
    } else if (user?.perfil === 'aluno') {
      query.where((b) => {
        b.whereIn('turmas.id', function () {
          this.select('turma_id')
            .from('turma_alunos')
            .where('aluno_id', user.id);
        });
        if (user.turma_id) {
          b.orWhere('turmas.id', user.turma_id);
        }
      });
    }

    if (filters.nome) {
      query.where('turmas.nome', 'ilike', `%${filters.nome}%`);
    }

    if (filters.ano) {
      query.where('turmas.ano', filters.ano);
    }

    if (filters.search) {
      query.where((b) => {
        b.where('turmas.nome', 'ilike', `%${filters.search}%`).orWhere(
          'turmas.codigo',
          'ilike',
          `%${filters.search}%`,
        );
      });
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('turmas.id as total')
      .first();
    const total = Number(countResult?.total || 0);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const dados = await query
      .limit(limit)
      .offset(offset)
      .orderBy('turmas.ano', 'desc')
      .orderBy('turmas.nome', 'asc');

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
    const turma = await knex(this.table)
      .leftJoin('usuarios', 'turmas.professor_id', '=', 'usuarios.id')
      .select([
        'turmas.*',
        'usuarios.nome as professor_nome',
        'usuarios.email as professor_email',
      ])
      .where('turmas.id', id)
      .first();

    if (!turma) {
      return null;
    }

    const alunos = await knex(this.pivotTable)
      .join('usuarios', `${this.pivotTable}.aluno_id`, '=', 'usuarios.id')
      .select([
        'usuarios.id',
        'usuarios.nome',
        'usuarios.email',
        `${this.pivotTable}.created_at as matriculado_em`,
      ])
      .where(`${this.pivotTable}.turma_id`, id);

    return {
      ...turma,
      alunos,
      total_alunos: alunos.length,
    };
  }

  async update(id: string, updateTurmaDto: UpdateTurmaDto) {
    return knex(this.table)
      .where({ id })
      .update({
        ...updateTurmaDto,
        updated_at: knex.fn.now(),
      })
      .returning('*');
  }

  async remove(id: string) {
    return knex(this.table).where({ id }).del();
  }

  async verificarMatricula(turmaId: string, alunoId: string) {
    return knex(this.pivotTable)
      .where({ turma_id: turmaId, aluno_id: alunoId })
      .first();
  }

  async countAlunos(turmaId: string) {
    const result = await knex(this.pivotTable)
      .where({ turma_id: turmaId })
      .count('aluno_id as total')
      .first();

    return Number(result?.total || 0);
  }

  async adicionarAluno(turmaId: string, alunoId: string) {
    return knex.transaction(async (trx) => {
      const [matricula] = await trx(this.pivotTable)
        .insert({
          turma_id: turmaId,
          aluno_id: alunoId,
          created_at: trx.fn.now(),
        })
        .returning('*');

      await trx('usuarios').where({ id: alunoId }).update({
        turma_id: turmaId,
        updated_at: trx.fn.now(),
      });

      return matricula;
    });
  }
}
