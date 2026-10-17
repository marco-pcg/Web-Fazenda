import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PermissoesService } from '../../permissoes/permissoes.service';
import { PermissoesRepository } from '../../permissoes/permissoes.repository';

describe('PermissoesService', () => {
  let service: PermissoesService;

  const mockPermissoesRepository = {
    findByName: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissoesService,
        {
          provide: PermissoesRepository,
          useValue: mockPermissoesRepository,
        },
      ],
    }).compile();

    service = module.get<PermissoesService>(PermissoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      nome: 'usuarios:criar',
      descricao: 'Permissão para criar usuários',
      modulo: 'usuarios',
      acao: 'criar',
    };

    it('deve criar uma permissão com sucesso', async () => {
      mockPermissoesRepository.findByName.mockResolvedValue(null);
      mockPermissoesRepository.create.mockResolvedValue([
        { id: 'perm-1', ...createDto },
      ]);

      const result = await service.create(createDto);

      expect(mockPermissoesRepository.findByName).toHaveBeenCalledWith(
        createDto.nome,
      );
      expect(mockPermissoesRepository.create).toHaveBeenCalled();
      expect(result.nome).toBe(createDto.nome);
      expect(result.id).toBeDefined();
    });

    it('deve lançar ConflictException se o nome da permissão já existir', async () => {
      mockPermissoesRepository.findByName.mockResolvedValue({
        id: 'perm-1',
        nome: createDto.nome,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPermissoesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de permissões', async () => {
      const permissoes = [{ id: 'perm-1', nome: 'usuarios:criar' }];
      mockPermissoesRepository.findAll.mockResolvedValue(permissoes);

      const result = await service.findAll({});

      expect(result).toEqual(permissoes);
      expect(mockPermissoesRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('deve retornar a permissão quando encontrada', async () => {
      const permissao = { id: 'perm-1', nome: 'usuarios:criar' };
      mockPermissoesRepository.findById.mockResolvedValue(permissao);

      const result = await service.findById('perm-1');

      expect(mockPermissoesRepository.findById).toHaveBeenCalledWith('perm-1');
      expect(result).toEqual(permissao);
    });

    it('deve lançar NotFoundException se a permissão não for encontrada', async () => {
      mockPermissoesRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar a permissão com sucesso', async () => {
      const existing = { id: 'perm-1', nome: 'usuarios:criar' };
      const updated = { id: 'perm-1', nome: 'usuarios:cadastrar' };
      mockPermissoesRepository.findById.mockResolvedValue(existing);
      mockPermissoesRepository.update.mockResolvedValue([updated]);

      const result = await service.update('perm-1', {
        nome: 'usuarios:cadastrar',
      });

      expect(mockPermissoesRepository.update).toHaveBeenCalledWith('perm-1', {
        nome: 'usuarios:cadastrar',
      });
      expect(result).toEqual(updated);
    });

    it('deve lançar NotFoundException se a permissão a ser atualizada não existir', async () => {
      mockPermissoesRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('inexistente', { nome: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPermissoesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover a permissão com sucesso', async () => {
      mockPermissoesRepository.findById.mockResolvedValue({ id: 'perm-1' });
      mockPermissoesRepository.remove.mockResolvedValue(1);

      await service.remove('perm-1');

      expect(mockPermissoesRepository.remove).toHaveBeenCalledWith('perm-1');
    });

    it('deve lançar NotFoundException se a permissão a remover não existir', async () => {
      mockPermissoesRepository.findById.mockResolvedValue(null);

      await expect(service.remove('inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPermissoesRepository.remove).not.toHaveBeenCalled();
    });
  });
});
