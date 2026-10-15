import { RankingReadModel } from '../read-models/ranking.read-model';

export const IRANKING_READ_REPOSITORY = 'IRankingReadRepository';

export interface IRANKING_READ_REPOSITORY_DATA {
  alunoId: string;
  problemaId: string;
  novaNota: number;
}

export interface IRankingReadRepository {
  atualizarRanking(dados: IRANKING_READ_REPOSITORY_DATA): Promise<void>;
  obterRankingPorProblema(problemaId: string): Promise<RankingReadModel[]>;
  obterRankingPorTurma(turmaId: string): Promise<RankingReadModel[]>;
}
