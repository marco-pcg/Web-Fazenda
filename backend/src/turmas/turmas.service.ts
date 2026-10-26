import { Injectable } from '@nestjs/common';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { TurmasRepository } from './turmas.repository';
import { httpExceptions } from 'src/common/errors-handler/http-exceptions';
import { randomUUID } from 'crypto';
import { FilterTurmasDto } from './dto/filter-turma.dto';

@Injectable()
export class TurmasService {
  constructor(private readonly repository: TurmasRepository) { }

  async create(createTurmaDto: CreateTurmaDto) {
    const turmaExistente = await this.repository.findByCode(createTurmaDto.codigoTurma);

    if (turmaExistente) {
      throw httpExceptions().conflict();
    }

    const { idProfessor, ...dadosTurma } = createTurmaDto;
    const turma = { id: randomUUID(), ...dadosTurma, professorId: idProfessor };
    const [created] = await this.repository.create(turma);
    return created;
  }

  async associarAlunos(turmaId: string, alunoId: string, user: any) {
    const turmaExistente = await this.repository.findById(turmaId);

    if (!turmaExistente) {
      throw httpExceptions().notFound();
    }

    if (user?.perfil === "professor" && turmaExistente.professorId !== user.id) {
      throw httpExceptions().forbidden();
    }

    const matriculado = await this.repository.verificarMatricula(turmaId, alunoId);

    if (matriculado) {
      throw httpExceptions().conflict();
    }

    const countResult = await this.repository.countAlunos(turmaId);
    const total = countResult ? Number(countResult.count) : 0;

    if (total >= turmaExistente.maxAlunos) {
      throw httpExceptions().badRequest();
    }

    const associated = await this.repository.associarAlunos(turmaId, alunoId);
    return associated;
  }

  async findAll(filter: FilterTurmasDto) {
    const turmas = await this.repository.findAll(filter);
    return turmas;
  }
}
