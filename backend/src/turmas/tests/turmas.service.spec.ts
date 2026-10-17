import { Test, TestingModule } from '@nestjs/testing';
import { TurmasService } from '../turmas.service';
import { TurmasRepository } from '../turmas.repository';

describe('TurmasService', () => {
  let service: TurmasService;

  const mockTurmasRepository = {
    findByCode: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    verificarMatricula: jest.fn(),
    countAlunos: jest.fn(),
    adicionarAluno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurmasService,
        {
          provide: TurmasRepository,
          useValue: mockTurmasRepository,
        },
      ],
    }).compile();

    service = module.get<TurmasService>(TurmasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
