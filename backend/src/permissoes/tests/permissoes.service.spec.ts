import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesService } from '../permissoes.service';
import { PermissoesRepository } from '../permissoes.repository';

describe('PermissoesService', () => {
  let service: PermissoesService;
  const repository = {
    findByName: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissoesService,
        { provide: PermissoesRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<PermissoesService>(PermissoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a permission when the name is available', async () => {
    repository.findByName.mockResolvedValue(undefined);
    repository.create.mockResolvedValue([
      { id: 'permission-id', nome: 'turmas:listar' },
    ]);

    await expect(
      service.create({
        nome: 'turmas:listar',
        descricao: 'Listar turmas',
        modulo: 'turmas',
        acao: 'listar',
      }),
    ).resolves.toEqual({ id: 'permission-id', nome: 'turmas:listar' });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'turmas:listar' }),
    );
  });

  it('rejects duplicate permissions', async () => {
    repository.findByName.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        nome: 'turmas:listar',
        descricao: 'Listar turmas',
        modulo: 'turmas',
        acao: 'listar',
      }),
    ).rejects.toThrow('Permissão já cadastrada');
  });

  it('throws when updating a missing permission', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      service.update('missing', { descricao: 'updated' }),
    ).rejects.toThrow('Permissão não encontrada');
    expect(repository.update).not.toHaveBeenCalled();
  });
});
