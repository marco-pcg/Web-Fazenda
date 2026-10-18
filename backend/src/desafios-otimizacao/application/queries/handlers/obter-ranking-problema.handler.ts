import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ObterRankingProblemaQuery } from '../obter-ranking-problema.query.js';
import { IRANKING_READ_REPOSITORY } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';
import type { IRankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';

@QueryHandler(ObterRankingProblemaQuery)
export class ObterRankingProblemaHandler implements IQueryHandler<ObterRankingProblemaQuery> {
  constructor(@Inject(IRANKING_READ_REPOSITORY) private readonly rankingReadRepo: IRankingReadRepository) {}

  async execute(query: ObterRankingProblemaQuery) {
    // Consulta direta e ultra-rápida na Tabela de Leitura (CQRS)
    return this.rankingReadRepo.obterRankingPorProblema(query.problemaId);
  }
}
