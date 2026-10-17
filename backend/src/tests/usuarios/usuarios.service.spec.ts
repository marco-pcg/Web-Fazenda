import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { UsuariosRepository } from '../../usuarios/usuarios.repository';

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

  describe('create', () => {
    const createDto = {
      nome: 'João Silva',
      email: 'joao@teste.com',
      senha: 'password123',
      perfil_id: 'perfil-uuid',
    };

    it('deve criar um usuário com sucesso, gerando hash da senha e omitindo a senha no retorno', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(null);
      mockUsuariosRepository.create.mockResolvedValue([
        {
          id: 'u1',
          nome: createDto.nome,
          email: createDto.email,
          perfil_id: createDto.perfil_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await service.create(createDto);

      expect(mockUsuariosRepository.findByEmail).toHaveBeenCalledWith(
        createDto.email,
      );
      expect(mockUsuariosRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.email).toBe(createDto.email);
      expect(result.nome).toBe(createDto.nome);
      expect(result.senha).toBeUndefined();
    });

    it('deve lançar ConflictException se o e-mail já estiver cadastrado', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: createDto.email,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsuariosRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista paginada e os metadados de paginação', async () => {
      const mockResult = {
        dados: [{ id: '1', nome: 'João', email: 'joao@teste.com' }],
        total: 1,
      };
      mockUsuariosRepository.findAllPaginated.mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        dados: mockResult.dados,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      });
      expect(mockUsuariosRepository.findAllPaginated).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        10,
        0,
      );
    });
  });

  describe('findById', () => {
    it('deve retornar o usuário sem a senha quando encontrado', async () => {
      const mockUser = {
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
        senha: 'hash-password',
      };
      mockUsuariosRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1');

      expect(result).toEqual({
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
      });
      expect(result.senha).toBeUndefined();
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockUsuariosRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário sem a senha quando encontrado pelo email', async () => {
      const mockUser = {
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
        senha: 'hash-password',
      };
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('joao@teste.com');

      expect(result).toEqual({
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
      });
      expect(result.senha).toBeUndefined();
    });

    it('deve lançar NotFoundException se o e-mail não existir', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.findByEmail('inexistente@teste.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário com sucesso', async () => {
      const existingUser = {
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
        senha: 'hash',
      };
      const updatedUser = {
        id: 'uuid-1',
        nome: 'João Atualizado',
        email: 'joao@teste.com',
        senha: 'hash',
      };

      mockUsuariosRepository.findById.mockResolvedValue(existingUser);
      mockUsuariosRepository.update.mockResolvedValue([updatedUser]);

      const result = await service.update('uuid-1', {
        nome: 'João Atualizado',
      });

      expect(result.nome).toBe('João Atualizado');
      expect(result.senha).toBeUndefined();
      expect(mockUsuariosRepository.update).toHaveBeenCalledWith('uuid-1', {
        nome: 'João Atualizado',
      });
    });

    it('deve criptografar nova senha se ela for informada na atualização', async () => {
      const existingUser = {
        id: 'uuid-1',
        nome: 'João',
        email: 'joao@teste.com',
        senha: 'hash',
      };
      mockUsuariosRepository.findById.mockResolvedValue(existingUser);
      mockUsuariosRepository.update.mockResolvedValue([
        { ...existingUser, senha: 'new-hash' },
      ]);

      await service.update('uuid-1', { senha: 'newpassword123' });

      expect(mockUsuariosRepository.update).toHaveBeenCalled();
      const updatePayload = mockUsuariosRepository.update.mock.calls[0][1];
      expect(updatePayload.senha).toBeDefined();
      expect(updatePayload.senha).not.toBe('newpassword123');
    });

    it('deve lançar NotFoundException se o usuário a ser atualizado não existir', async () => {
      mockUsuariosRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('uuid-inexistente', { nome: 'Novo Nome' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsuariosRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover o usuário com sucesso se existir', async () => {
      mockUsuariosRepository.findById.mockResolvedValue({ id: 'uuid-1' });
      mockUsuariosRepository.remove.mockResolvedValue(1);

      await service.remove('uuid-1');

      expect(mockUsuariosRepository.remove).toHaveBeenCalledWith('uuid-1');
    });

    it('deve lançar NotFoundException se o usuário a remover não existir', async () => {
      mockUsuariosRepository.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsuariosRepository.remove).not.toHaveBeenCalled();
    });
  });
});
