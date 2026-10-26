import { Injectable } from "@nestjs/common";
import { CreateTurmaDto } from "./dto/create-turma.dto";
import { AssociarAlunosDto } from "./dto/associar-aluno.dto";
import { FilterTurmasDto } from "./dto/filter-turma.dto";
import { database as knex } from 'src/db/knex-connection';

@Injectable()
export class TurmasRepository {
    private readonly table = 'turmas';
    private readonly pivotTable = 'turma-alunos';

    async findByCode(codigo: string) {
        return knex(this.table).where({ codigoTurma: codigo }).first();
    }

    async create(data: Omit<CreateTurmaDto, 'idProfessor'> & { id: string; professorId: string }) {
        return knex(this.table).insert(data).returning('*');
    }

    async findById(id: string) {
        return knex(this.table).where({ id }).first();
    }

    async verificarMatricula(turmaId: string, alunoId: string) {
        return knex(this.pivotTable).where({ turmaId, alunoId }).first();
    }

    async countAlunos(turmaId: string) {
        return knex(this.pivotTable).where({ turmaId }).count().first();
    }

    async associarAlunos(turmaId: string, alunoId: string){
        const [matricula] = await knex(this.pivotTable).insert({ turmaId: turmaId, alunoId: alunoId, created_at: knex.fn.now() }).returning('*');
        await knex('usuarios').where({ id: alunoId }).update({ turmaId: turmaId, updated_at: knex.fn.now() });
        return matricula;
    }

    async findAll(filter: FilterTurmasDto) {
        const { nome, ano } = filter;

        const query = knex(this.table).select('*');

        if(nome) {
            query.where('nome', 'ilike', `%${nome}%`);
        }
        if(ano) {
            query.where('ano', ano);
        }

        const total = knex(this.table).count().first();
        const dados = await query.orderBy('id', 'desc');

        return { dados, total: Number(total) };
    }
}