import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CriarProblemaDto } from './dtos/criar-problema.dto';
import { SubmeterTentativaDto } from './dtos/submeter-tentativa.dto';
import { FiltrarProblemasDto } from './dtos/filtrar-problemas.dto';

import { SubmeterTentativaCommand } from '../application/commands/submeter-tentativa.command';
import { ListarProblemasQuery } from '../application/queries/listar-problemas.query';
import { ObterGraficoProblemaQuery } from '../application/queries/obter-grafico-problema.query';

@Controller('problemas')
export class ProblemasController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async listar(@Query() filtros: FiltrarProblemasDto) {
    return this.queryBus.execute(new ListarProblemasQuery(filtros));
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    // Retorna detalhes do desafio
  }

  @Post()
  async criar(@Body() dto: CriarProblemaDto) {
    // Dispara comando de criação
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    // Valida Regra 13 (não editar se houver tentativas)
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    // Valida Regra 13
  }

  @Post(':id/publicar')
  async publicar(@Param('id') id: string) {
    // Altera status para publicado
  }

  @Post(':id/restricoes')
  async adicionarRestricao(@Param('id') id: string, @Body() dto: any) {
    // Adiciona restrição
  }

  // BÔNUS CQRS: Invocação do Command de Gravação + Correção
  @Post(':id/tentativas')
  async submeterTentativa(
    @Param('id') problemaId: string,
    @Body() dto: SubmeterTentativaDto,
  ) {
    // Exemplo pegando alunoId do Token JWT/Sessão (simulado 'aluno-123')
    const alunoId = 'aluno-123';
    return this.commandBus.execute(
      new SubmeterTentativaCommand(problemaId, alunoId, dto.valores),
    );
  }

  @Get(':id/grafico')
  async obterGrafico(@Param('id') id: string) {
    return this.queryBus.execute(new ObterGraficoProblemaQuery(id));
  }
}
