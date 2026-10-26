import { Controller, Get, Post, Body, Param, Req, Query } from '@nestjs/common';
import { TurmasService } from './turmas.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { FilterTurmasDto } from './dto/filter-turma.dto';
import { AssociarAlunosDto } from './dto/associar-aluno.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) { }

  @Post()
  @RequirePermissions('CRIAR_TURMA')
  create(@Body() createTurmaDto: CreateTurmaDto) {
    return this.turmasService.create(createTurmaDto);
  }

  @Post(':id/alunos')
  @RequirePermissions('EDITAR_TURMA')
  associarAlunos(@Param('id') id: string, @Body() associarAlunosDto: AssociarAlunosDto, @Req() req: any) {
    return this.turmasService.associarAlunos(id, associarAlunosDto.alunoId, req.user);
  }

  @Get()
  @RequirePermissions('LISTAR_TURMAS')
  findAll(@Query() filter: FilterTurmasDto) {
    return this.turmasService.findAll(filter);
  }
}
