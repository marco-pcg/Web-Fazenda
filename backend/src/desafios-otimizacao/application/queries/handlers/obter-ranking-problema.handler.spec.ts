import { Test, TestingModule } from '@nestjs/testing';
import { ObterRankingProblemaHandler } from './obter-ranking-problema.handler';
import { ObterRankingProblemaQuery } from '../obter-ranking-problema.query';
import { RankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository';

describe('ObterRankingProblemaHandler (Testes Unitários)', () => {
  let handler: ObterRankingProblemaHandler;
  let rankingReadRepo: jest.Mocked<RankingReadRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObterRankingProblemaHandler,
        {
          provide: RankingReadRepository,
          useValue: { obterRankingPorProblema: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<ObterRankingProblemaHandler>(ObterRankingProblemaHandler);
    rankingReadRepo = module.get(RankingReadRepository);
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
