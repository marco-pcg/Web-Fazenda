import { Test, TestingModule } from '@nestjs/testing';
import { PerfisService } from '../perfis.service';
import { PerfisRepository } from '../perfis.repository';

describe('PerfisService', () => {
  let service: PerfisService;

  const mockPerfisRepository = {
    findByNome: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    vincularPermissoes: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findPermissoesByPerfilId: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfisService,
        {
          provide: PerfisRepository,
          useValue: mockPerfisRepository,
        },
      ],
    }).compile();

    service = module.get<PerfisService>(PerfisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
