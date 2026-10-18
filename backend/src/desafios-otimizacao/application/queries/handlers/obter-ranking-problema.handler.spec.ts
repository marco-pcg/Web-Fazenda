import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ObterRankingProblemaHandler } from './obter-ranking-problema.handler';
import { ObterRankingProblemaQuery } from '../obter-ranking-problema.query';
import { IRANKING_READ_REPOSITORY } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';

describe('ObterRankingProblemaHandler (Testes Unitários)', () => {
  let handler: ObterRankingProblemaHandler;
  let rankingReadRepo: { obterRankingPorProblema: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObterRankingProblemaHandler,
        {
          provide: IRANKING_READ_REPOSITORY,
          useValue: { obterRankingPorProblema: vi.fn() },
        },
      ],
    }).compile();

    handler = module.get<ObterRankingProblemaHandler>(ObterRankingProblemaHandler);
    rankingReadRepo = module.get(IRANKING_READ_REPOSITORY);
  });

  it('deve retornar o ranking consultando a tabela de leitura desnormalizada', async () => {
    const mockRanking = [
      { alunoId: 'aluno-1', nomeAluno: 'João', maiorNota: 10.0 },
      { alunoId: 'aluno-2', nomeAluno: 'Maria', maiorNota: 8.5 },
    ];

    rankingReadRepo.obterRankingPorProblema.mockResolvedValue(mockRanking as any);

    const query = new ObterRankingProblemaQuery('problema-1');
    const resultado = await handler.execute(query);

    expect(resultado).toEqual(mockRanking);
    expect(rankingReadRepo.obterRankingPorProblema).toHaveBeenCalledWith('problema-1');
  });
});
