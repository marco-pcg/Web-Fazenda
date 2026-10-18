import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IRANKING_READ_REPOSITORY } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';
import type { IRankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';
import { ObterRankingTurmaQuery } from '../obter-ranking-turma.query.js';

@QueryHandler(ObterRankingTurmaQuery)
export class ObterRankingTurmaHandler implements IQueryHandler<ObterRankingTurmaQuery> {
  constructor(@Inject(IRANKING_READ_REPOSITORY) private readonly rankingReadRepo: IRankingReadRepository) {}

  execute(query: ObterRankingTurmaQuery) {
    return this.rankingReadRepo.obterRankingPorTurma(query.turmaId);
  }
}
