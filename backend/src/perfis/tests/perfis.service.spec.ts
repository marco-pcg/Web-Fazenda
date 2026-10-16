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
    jest.clearAllMocks();
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

  it('includes permissions when finding a profile', async () => {
    mockPerfisRepository.findById.mockResolvedValue({
      id: 'profile-id',
      nome: 'professor',
    });
    mockPerfisRepository.findPermissoesByPerfilId.mockResolvedValue([
      { id: 'permission-id', nome: 'turmas:listar' },
    ]);

    await expect(service.findById('profile-id')).resolves.toEqual({
      id: 'profile-id',
      nome: 'professor',
      permissoes: [{ id: 'permission-id', nome: 'turmas:listar' }],
    });
  });

  it('links permissions only for an existing profile', async () => {
    mockPerfisRepository.findById.mockResolvedValue({ id: 'profile-id' });

    await expect(
      service.vincularPermissoes('profile-id', ['permission-id']),
    ).resolves.toEqual({ message: 'Permissões atualizadas com sucesso' });
    expect(mockPerfisRepository.vincularPermissoes).toHaveBeenCalledWith(
      'profile-id',
      ['permission-id'],
    );
  });

  it('throws when linking permissions to a missing profile', async () => {
    mockPerfisRepository.findById.mockResolvedValue(undefined);

    await expect(service.vincularPermissoes('missing', [])).rejects.toThrow(
      'Perfil não encontrado',
    );
  });
});
