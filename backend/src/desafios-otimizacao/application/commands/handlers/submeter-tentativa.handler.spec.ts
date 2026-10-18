import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmeterTentativaHandler } from './submeter-tentativa.handler';
import { SubmeterTentativaCommand } from '../submeter-tentativa.command';
import { IPROBLEMA_REPOSITORY } from '../../../infrastructure/repositories/problema.repository.interface.js';
import { ITENTATIVA_REPOSITORY } from '../../../infrastructure/repositories/tentativa.repository.interface.js';
import { AvaliadorOtimizacaoService } from '../../../domain/services/avaliador-otimizacao.service';

describe('SubmeterTentativaHandler (Testes Unitários)', () => {
  let handler: SubmeterTentativaHandler;
  let problemaRepo: { findById: ReturnType<typeof vi.fn> };
  let tentativaRepo: { findByAlunoEProblema: ReturnType<typeof vi.fn>; obterMaiorNotaNivelAnterior: ReturnType<typeof vi.fn>; salvar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmeterTentativaHandler,
        {
          provide: IPROBLEMA_REPOSITORY,
          useValue: { findById: vi.fn() },
        },
        {
          provide: ITENTATIVA_REPOSITORY,
          useValue: {
            findByAlunoEProblema: vi.fn(),
            obterMaiorNotaNivelAnterior: vi.fn(),
            salvar: vi.fn(),
          },
        },
        {
          provide: AvaliadorOtimizacaoService,
          useValue: { avaliarTentativa: vi.fn() },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: vi.fn().mockImplementation((obj) => ({
              ...obj,
              apply: vi.fn(),
              commit: vi.fn(),
            })),
          },
        },
      ],
    }).compile();

    handler = module.get<SubmeterTentativaHandler>(SubmeterTentativaHandler);
    problemaRepo = module.get(IPROBLEMA_REPOSITORY);
    tentativaRepo = module.get(ITENTATIVA_REPOSITORY);
  });

  it('deve lançar NotFoundException se o problema não existir', async () => {
    problemaRepo.findById.mockResolvedValue(null);

    const command = new SubmeterTentativaCommand('id-invalido', 'aluno-1', { x1: 10 });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se o prazo estiver expirado (Regra 11)', async () => {
    const prazoPassado = new Date(Date.now() - 3600000); // 1 hora atrás
    problemaRepo.findById.mockResolvedValue({
      id: 'p1',
      prazoLimite: prazoPassado,
      limiteTentativas: 3,
      nivel: 1,
    } as any);

    const command = new SubmeterTentativaCommand('p1', 'aluno-1', { x1: 10 });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('deve lançar ForbiddenException se a nota do nível anterior for menor que 7 (Regra 12)', async () => {
    const prazoFuturo = new Date(Date.now() + 3600000);
    problemaRepo.findById.mockResolvedValue({
      id: 'p2',
      prazoLimite: prazoFuturo,
      limiteTentativas: 5,
      nivel: 2, // Requer nível 1 concluído
    } as any);

    tentativaRepo.findByAlunoEProblema.mockResolvedValue([]);
    // Aluno tirou nota 5.5 no nível 1
    tentativaRepo.obterMaiorNotaNivelAnterior.mockResolvedValue(5.5);

    const command = new SubmeterTentativaCommand('p2', 'aluno-1', { x1: 10 });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });
});
