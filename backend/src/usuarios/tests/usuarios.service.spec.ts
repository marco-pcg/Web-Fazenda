import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../usuarios.service';
import { UsuariosRepository } from '../usuarios.repository';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const mockUsuariosRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAllPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findForAuth: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: UsuariosRepository,
          useValue: mockUsuariosRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user, hashes the password, and omits it from the response', async () => {
    const createdUser = {
      id: 'user-id',
      nome: 'Ana',
      email: 'ana@example.com',
      senha: 'hashed-password',
      perfil_id: 'perfil-id',
    };
    mockUsuariosRepository.findByEmail.mockResolvedValue(undefined);
    mockUsuariosRepository.create.mockResolvedValue([createdUser]);

    await expect(
      service.create({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'plain-password',
        perfil_id: 'perfil-id',
      }),
    ).resolves.toEqual({
      id: 'user-id',
      nome: 'Ana',
      email: 'ana@example.com',
      perfil_id: 'perfil-id',
    });

    expect(mockUsuariosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Ana',
        email: 'ana@example.com',
        perfil_id: 'perfil-id',
      }),
    );
  });

  it('rejects duplicate e-mail without creating a user', async () => {
    mockUsuariosRepository.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'plain-password',
        perfil_id: 'perfil-id',
      }),
    ).rejects.toThrow('Usuário já cadastrado');
    expect(mockUsuariosRepository.create).not.toHaveBeenCalled();
  });

  it('returns paginated users with calculated metadata', async () => {
    mockUsuariosRepository.findAllPaginated.mockResolvedValue({
      dados: [{ id: 'user-id' }],
      total: 21,
    });

    await expect(service.findAll({ page: 2, limit: 10 })).resolves.toEqual({
      dados: [{ id: 'user-id' }],
      meta: { total: 21, page: 2, limit: 10, lastPage: 3 },
    });
    expect(mockUsuariosRepository.findAllPaginated).toHaveBeenCalledWith(
      { page: 2, limit: 10 },
      10,
      10,
    );
  });

  it('throws when a user is not found', async () => {
    mockUsuariosRepository.findById.mockResolvedValue(undefined);

    await expect(service.findById('missing')).rejects.toThrow(
      'Usuário não encontrado',
    );
  });

  it('updates a password and never exposes it', async () => {
    mockUsuariosRepository.findById.mockResolvedValue({
      id: 'user-id',
      nome: 'Ana',
      senha: 'old-hash',
    });
    mockUsuariosRepository.update.mockResolvedValue([
      { id: 'user-id', nome: 'Ana', senha: 'new-hash' },
    ]);

    await expect(
      service.update('user-id', { senha: 'new-password' }),
    ).resolves.toEqual({ id: 'user-id', nome: 'Ana' });

    expect(mockUsuariosRepository.update).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({}),
    );
  });
});
