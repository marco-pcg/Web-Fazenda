import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PerfisService } from '../../perfis/perfis.service';
import { PerfisRepository } from '../../perfis/perfis.repository';

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
    findPermissoesByPerfilId: jest.fn(),
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

  describe('create', () => {
    const createDto = {
      nome: 'Coordenador',
      descricao: 'Perfil de coordenador',
      ativo: true,
    };

    it('deve criar um perfil com sucesso', async () => {
      mockPerfisRepository.findByNome.mockResolvedValue(null);
      mockPerfisRepository.create.mockResolvedValue([
        { id: 'p1', nome: createDto.nome, ativo: true },
      ]);

      const result = await service.create(createDto);

      expect(mockPerfisRepository.findByNome).toHaveBeenCalledWith(
        createDto.nome,
      );
      expect(mockPerfisRepository.create).toHaveBeenCalled();
      expect(result.nome).toBe(createDto.nome);
      expect(result.id).toBeDefined();
    });

    it('deve lançar ConflictException se o perfil com este nome já existir', async () => {
      mockPerfisRepository.findByNome.mockResolvedValue({
        id: 'p1',
        nome: createDto.nome,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPerfisRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de perfis', async () => {
      const perfis = [{ id: 'p1', nome: 'Admin' }];
      mockPerfisRepository.findAll.mockResolvedValue(perfis);

      const result = await service.findAll({});

      expect(result).toEqual(perfis);
      expect(mockPerfisRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('deve retornar o perfil e suas permissões associadas', async () => {
      const perfil = { id: 'p1', nome: 'Admin' };
      const permissoes = [{ id: 'perm-1', nome: 'usuarios:criar' }];
      mockPerfisRepository.findById.mockResolvedValue(perfil);
      mockPerfisRepository.findPermissoesByPerfilId.mockResolvedValue(
        permissoes,
      );

      const result = await service.findById('p1');

      expect(mockPerfisRepository.findById).toHaveBeenCalledWith('p1');
      expect(
        mockPerfisRepository.findPermissoesByPerfilId,
      ).toHaveBeenCalledWith('p1');
      expect(result).toEqual({ ...perfil, permissoes });
    });

    it('deve lançar NotFoundException se o perfil não existir', async () => {
      mockPerfisRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('vincularPermissoes', () => {
    it('deve vincular permissões com sucesso', async () => {
      mockPerfisRepository.findById.mockResolvedValue({ id: 'p1' });
      mockPerfisRepository.vincularPermissoes.mockResolvedValue(undefined);

      const result = await service.vincularPermissoes('p1', [
        'perm-1',
        'perm-2',
      ]);

      expect(mockPerfisRepository.vincularPermissoes).toHaveBeenCalledWith(
        'p1',
        ['perm-1', 'perm-2'],
      );
      expect(result).toEqual({ message: 'Permissões atualizadas com sucesso' });
    });

    it('deve lançar NotFoundException se o perfil não existir ao vincular permissões', async () => {
      mockPerfisRepository.findById.mockResolvedValue(null);

      await expect(
        service.vincularPermissoes('p1', ['perm-1']),
      ).rejects.toThrow(NotFoundException);
      expect(mockPerfisRepository.vincularPermissoes).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar o perfil com sucesso', async () => {
      const existing = { id: 'p1', nome: 'Admin' };
      const updated = { id: 'p1', nome: 'Admin Master' };
      mockPerfisRepository.findById.mockResolvedValue(existing);
      mockPerfisRepository.update.mockResolvedValue([updated]);

      const result = await service.update('p1', { nome: 'Admin Master' });

      expect(mockPerfisRepository.update).toHaveBeenCalledWith('p1', {
        nome: 'Admin Master',
      });
      expect(result).toEqual(updated);
    });

    it('deve lançar NotFoundException se o perfil a atualizar não existir', async () => {
      mockPerfisRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('inexistente', { nome: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPerfisRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover o perfil com sucesso', async () => {
      mockPerfisRepository.findById.mockResolvedValue({ id: 'p1' });
      mockPerfisRepository.remove.mockResolvedValue(1);

      await service.remove('p1');

      expect(mockPerfisRepository.remove).toHaveBeenCalledWith('p1');
    });

    it('deve lançar NotFoundException se o perfil a remover não existir', async () => {
      mockPerfisRepository.findById.mockResolvedValue(null);

      await expect(service.remove('inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPerfisRepository.remove).not.toHaveBeenCalled();
    });
  });
});
