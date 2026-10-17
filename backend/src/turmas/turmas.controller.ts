import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { FilterTurmaDto } from './dto/filter-turma.dto';
import { AdicionarAlunoDto } from './dto/adicionar-aluno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Turmas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @RequirePermissions('turmas:criar')
  @ApiOperation({ summary: 'Cadastra uma nova turma' })
  @ApiResponse({ status: 201, description: 'Turma cadastrada com sucesso' })
  @ApiResponse({ status: 409, description: 'Código de turma já existente' })
  create(@Body() createTurmaDto: CreateTurmaDto) {
    return this.turmasService.create(createTurmaDto);
  }

  @Get()
  @RequirePermissions('turmas:listar')
  @ApiOperation({ summary: 'Lista turmas com filtros por nome e ano (professor só acessa a própria turma)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de turmas' })
  findAll(@Query() filtros: FilterTurmaDto, @Req() req: any) {
    return this.turmasService.findAll(filtros, req.user);
  }

  @Get(':id')
  @RequirePermissions('turmas:visualizar')
  @ApiOperation({ summary: 'Busca turma por ID e seus alunos matriculados' })
  @ApiResponse({ status: 200, description: 'Turma encontrada' })
  @ApiResponse({ status: 403, description: 'Professor só tem acesso à própria turma' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  findById(@Param('id') id: string, @Req() req: any) {
    return this.turmasService.findById(id, req.user);
  }

  @Patch(':id')
  @RequirePermissions('turmas:editar')
  @ApiOperation({ summary: 'Atualiza dados de uma turma' })
  @ApiResponse({ status: 200, description: 'Turma atualizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado para turma de outro professor' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  update(@Param('id') id: string, @Body() updateTurmaDto: UpdateTurmaDto, @Req() req: any) {
    return this.turmasService.update(id, updateTurmaDto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('turmas:deletar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma turma por ID' })
  @ApiResponse({ status: 204, description: 'Turma removida com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado para turma de outro professor' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.turmasService.remove(id, req.user);
  }

  @Post(':id/alunos')
  @RequirePermissions('turmas:editar')
  @ApiOperation({ summary: 'Matricula um aluno em uma turma' })
  @ApiResponse({ status: 201, description: 'Aluno matriculado com sucesso' })
  @ApiResponse({ status: 400, description: 'Turma lotada' })
  @ApiResponse({ status: 403, description: 'Acesso negado para turma de outro professor' })
  @ApiResponse({ status: 409, description: 'Aluno já matriculado nesta turma' })
  adicionarAluno(@Param('id') id: string, @Body() adicionarAlunoDto: AdicionarAlunoDto, @Req() req: any) {
    return this.turmasService.adicionarAluno(id, adicionarAlunoDto.aluno_id, req.user);
  }
}
