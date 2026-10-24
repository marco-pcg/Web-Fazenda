import { Controller, Get, Post, Body, Param, Req, Query } from '@nestjs/common';
import { TurmasService } from './turmas.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { FilterTurmasDto } from './dto/filter-turma.dto';
import { AssociarAlunosDto } from './dto/associar-aluno.dto';

@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) { }

  @Post()
  create(@Body() createTurmaDto: CreateTurmaDto) {
    return this.turmasService.create(createTurmaDto);
  }

  @Post(':id/alunos')
  associarAlunos(@Param('id') id: string, @Body() associarAlunosDto: AssociarAlunosDto, @Req() req: any) {
    return this.turmasService.associarAlunos(id, associarAlunosDto.alunoId, req.user);
  }

  @Get()
  findAll(@Query() filter: FilterTurmasDto) {
    return this.turmasService.findAll(filter);
  }
}
