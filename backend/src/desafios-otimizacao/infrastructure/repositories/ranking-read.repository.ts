import { Injectable } from '@nestjs/common';
import {
  IRankingReadRepository,
  IRANKING_READ_REPOSITORY_DATA,
} from './ranking-read.repository.interface.js';
import type { RankingReadModel } from '../../domain/read-models/ranking.read-model.js';

@Injectable()
export class RankingReadRepository implements IRankingReadRepository {
  private readonly rankings = new Map<string, RankingReadModel>();

  async atualizarRanking(dados: IRANKING_READ_REPOSITORY_DATA): Promise<void> {
    const key = `${dados.problemaId}:${dados.alunoId}`;
    const atual = this.rankings.get(key);
    this.rankings.set(key, {
      id: atual?.id ?? crypto.randomUUID(),
      problemaId: dados.problemaId,
      turmaId: atual?.turmaId ?? '',
      alunoId: dados.alunoId,
      nomeAluno: atual?.nomeAluno ?? dados.alunoId,
      maiorNota: Math.max(atual?.maiorNota ?? 0, dados.novaNota),
      quantidadeTentativas: (atual?.quantidadeTentativas ?? 0) + 1,
      atualizadoEm: new Date(),
    });
  }

  async obterRankingPorProblema(problemaId: string): Promise<RankingReadModel[]> {
    return [...this.rankings.values()]
      .filter((item) => item.problemaId === problemaId)
      .sort((a, b) => b.maiorNota - a.maiorNota)
      .map((item) => structuredClone(item));
  }

  async obterRankingPorTurma(turmaId: string): Promise<RankingReadModel[]> {
    return [...this.rankings.values()].filter((item) => item.turmaId === turmaId).sort((a, b) => b.maiorNota - a.maiorNota).map((item) => structuredClone(item));
  }
}
