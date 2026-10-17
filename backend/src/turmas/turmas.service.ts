import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { FilterTurmaDto } from './dto/filter-turma.dto';
import { TurmasRepository } from './turmas.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class TurmasService {
  constructor(private readonly repository: TurmasRepository) {}

  async create(createTurmaDto: CreateTurmaDto) {
    const turmaExists = await this.repository.findByCode(createTurmaDto.codigo);
    if (turmaExists) {
      throw new ConflictException(
        `Já existe uma turma cadastrada com o código ${createTurmaDto.codigo}.`,
      );
    }

    const newTurma = { id: randomUUID(), ...createTurmaDto };
    const [created] = await this.repository.create(newTurma);
    return created;
  }

  async findAll(filtros: FilterTurmaDto, user: any) {
    return this.repository.findAll(filtros, user);
  }

  async findById(id: string, user: any) {
    const turma = await this.repository.findById(id);

    if (!turma) {
      throw new NotFoundException(`Turma não encontrada`);
    }

    // Regra de negócio: o professor só acessa a própria turma
    if (user?.perfil === 'professor' && turma.professor_id !== user.id) {
      throw new ForbiddenException(
        'Você só pode acessar turmas das quais é o professor responsável.',
      );
    }

    // Regra de negócio: aluno só acessa a própria turma
    if (user?.perfil === 'aluno') {
      const alunoMatriculado = await this.repository.verificarMatricula(
        turma.id,
        user.id,
      );
      if (!alunoMatriculado && user.turma_id !== turma.id) {
        throw new ForbiddenException(
          'Você só tem acesso à turma em que está matriculado.',
        );
      }
    }

    return turma;
  }

  async update(id: string, updateTurmaDto: UpdateTurmaDto, user: any) {
    const turmaExists = await this.repository.findById(id);

    if (!turmaExists) {
      throw new NotFoundException(`Turma não encontrada`);
    }

    if (user?.perfil === 'professor' && turmaExists.professor_id !== user.id) {
      throw new ForbiddenException(
        'Você só pode atualizar turmas das quais é o professor responsável.',
      );
    }

    const [updated] = await this.repository.update(id, updateTurmaDto);
    return updated;
  }

  async remove(id: string, user: any) {
    const turmaExists = await this.repository.findById(id);

    if (!turmaExists) {
      throw new NotFoundException(`Turma não encontrada`);
    }

    if (user?.perfil === 'professor' && turmaExists.professor_id !== user.id) {
      throw new ForbiddenException(
        'Você só pode remover turmas das quais é o professor responsável.',
      );
    }

    await this.repository.remove(id);
  }

  async adicionarAluno(turmaId: string, alunoId: string, user: any) {
    const turmaExists = await this.repository.findById(turmaId);

    if (!turmaExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (user?.perfil === 'professor' && turmaExists.professor_id !== user.id) {
      throw new ForbiddenException(
        'Você só pode adicionar alunos nas suas próprias turmas.',
      );
    }

    const alunoMatriculado = await this.repository.verificarMatricula(
      turmaId,
      alunoId,
    );
    if (alunoMatriculado) {
      throw new ConflictException('Aluno já matriculado nesta turma.');
    }

    const totalAlunos = await this.repository.countAlunos(turmaId);
    if (totalAlunos >= turmaExists.max_alunos) {
      throw new BadRequestException(
        'A turma atingiu a capacidade máxima de alunos.',
      );
    }

    return this.repository.adicionarAluno(turmaId, alunoId);
  }
}
