import { Injectable } from '@nestjs/common';
import {
  IRankingReadRepository,
  IRANKING_READ_REPOSITORY_DATA,
} from '../../domain/repositories/ranking-read.repository.interface';
import { RankingReadModel } from '../../domain/read-models/ranking.read-model';

@Injectable()
export class RankingReadPrismaRepository implements IRankingReadRepository {
  async atualizarRanking(dados: IRANKING_READ_REPOSITORY_DATA): Promise<void> {
    // Atualiza a tabela desnormalizada no banco de dados via Prisma
  }

  async obterRankingPorProblema(problemaId: string): Promise<RankingReadModel[]> {
    return [];
  }

  async obterRankingPorTurma(turmaId: string): Promise<RankingReadModel[]> {
    return [];
  }
}
