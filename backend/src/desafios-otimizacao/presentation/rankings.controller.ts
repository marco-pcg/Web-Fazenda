import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ObterRankingProblemaQuery } from '../application/queries/obter-ranking-problema.query';
import { ObterRankingTurmaQuery } from '../application/queries/obter-ranking-turma.query';

@Controller()
export class RankingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('problemas/:id/ranking')
  async obterRankingProblema(@Param('id') problemaId: string) {
    return this.queryBus.execute(new ObterRankingProblemaQuery(problemaId));
  }

  @Get('turmas/:id/ranking')
  async obterRankingTurma(@Param('id') turmaId: string) {
    return this.queryBus.execute(new ObterRankingTurmaQuery(turmaId));
  }
}
