import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ObterRankingProblemaQuery } from '../obter-ranking-problema.query';
import { RankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository';

@QueryHandler(ObterRankingProblemaQuery)
export class ObterRankingProblemaHandler implements IQueryHandler<ObterRankingProblemaQuery> {
  constructor(private readonly rankingReadRepo: RankingReadRepository) {}

  async execute(query: ObterRankingProblemaQuery) {
    // Consulta direta e ultra-rápida na Tabela de Leitura (CQRS)
    return this.rankingReadRepo.obterRankingPorProblema(query.problemaId);
  }
}
