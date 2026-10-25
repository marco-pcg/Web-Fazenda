import { Injectable } from "@nestjs/common";
import { CreateTurmaDto } from "./dto/create-turma.dto";
import { AssociarAlunosDto } from "./dto/associar-aluno.dto";
import { FilterTurmasDto } from "./dto/filter-turma.dto";
import { database as knex } from 'src/db/knex-connection';

@Injectable()
export class TurmasRepository {
    private readonly table = 'turmas';
    private readonly pivotTable = 'turma-alunos';


}