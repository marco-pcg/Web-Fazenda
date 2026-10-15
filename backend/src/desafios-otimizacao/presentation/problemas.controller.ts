import { Body, ConflictException, Controller, Delete, Get, Inject, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CriarProblemaCommand } from '../application/commands/criar-problema.command.js';
import { SubmeterTentativaCommand } from '../application/commands/submeter-tentativa.command.js';
import { ListarProblemasQuery } from '../application/queries/listar-problemas.query.js';
import { ObterGraficoProblemaQuery } from '../application/queries/obter-grafico-problema.query.js';
import { IPROBLEMA_REPOSITORY } from '../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../infrastructure/repositories/problema.repository.interface.js';
import { CriarProblemaDto } from './dtos/criar-problema.dto.js';
import { FiltrarProblemaDto } from './dtos/filtrar-problema.dto.js';
import { SubmeterTentativaDto } from './dtos/submeter-tentativa.dto.js';

@Controller('problemas')
export class ProblemasController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository,
  ) {}

  @Get()
  listar(@Query() filtros: FiltrarProblemaDto) {
    return this.queryBus.execute(new ListarProblemasQuery(filtros));
  }

  @Get(':id')
  async obterPorId(@Param('id') id: string) {
    const problema = await this.problemaRepo.findById(id);
    if (!problema) throw new NotFoundException('Desafio não encontrado.');
    return problema;
  }

  @Post()
  criar(@Body() dto: CriarProblemaDto) {
    return this.commandBus.execute(new CriarProblemaCommand(
      dto.titulo,
      dto.descricao,
      dto.nivel,
      dto.tipo,
      new Date(dto.prazoLimite),
      dto.limiteTentativas,
      dto.funcaoObjetivo,
      dto.valorOtimoZ,
    ));
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: Partial<CriarProblemaDto>) {
    const problema = await this.problemaRepo.findById(id);
    if (!problema) throw new NotFoundException('Desafio não encontrado.');
    if (problema.temTentativas()) throw new ConflictException('Problemas com tentativas não podem ser editados.');
    return this.problemaRepo.atualizar(id, {
      ...dto,
      prazoLimite: dto.prazoLimite ? new Date(dto.prazoLimite) : undefined,
    });
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    const problema = await this.problemaRepo.findById(id);
    if (!problema) throw new NotFoundException('Desafio não encontrado.');
    if (problema.temTentativas()) throw new ConflictException('Problemas com tentativas não podem ser removidos.');
    await this.problemaRepo.deletar(id);
  }

  @Post(':id/publicar')
  async publicar(@Param('id') id: string) {
    const problema = await this.problemaRepo.findById(id);
    if (!problema) throw new NotFoundException('Desafio não encontrado.');
    return this.problemaRepo.atualizar(id, { publicado: true });
  }

  @Post(':id/restricoes')
  async adicionarRestricao(@Param('id') id: string, @Body() dto: any) {
    return this.problemaRepo.adicionarRestricao(id, dto);
  }

  @Post(':id/tentativas')
  submeterTentativa(@Param('id') problemaId: string, @Body() dto: SubmeterTentativaDto) {
    return this.commandBus.execute(new SubmeterTentativaCommand(problemaId, 'aluno-123', dto.valores));
  }

  @Get(':id/grafico')
  obterGrafico(@Param('id') id: string) {
    return this.queryBus.execute(new ObterGraficoProblemaQuery(id));
  }
}
