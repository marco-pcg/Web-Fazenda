import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TurmasService } from '../../turmas/turmas.service';
import { TurmasRepository } from '../../turmas/turmas.repository';

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
    jest.clearAllMocks();

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

  describe('create', () => {
    const createDto = {
      nome: 'Turma A',
      codigo: '3A01',
      ano: 2026,
      max_alunos: 30,
      professor_id: 'prof-1',
    };

    it('deve criar uma turma com sucesso', async () => {
      mockTurmasRepository.findByCode.mockResolvedValue(null);
      mockTurmasRepository.create.mockResolvedValue([
        { id: 't1', ...createDto },
      ]);

      const result = await service.create(createDto);

      expect(mockTurmasRepository.findByCode).toHaveBeenCalledWith('3A01');
      expect(mockTurmasRepository.create).toHaveBeenCalled();
      expect(result.codigo).toBe('3A01');
      expect(result.id).toBeDefined();
    });

    it('deve lançar ConflictException se o código da turma já existir', async () => {
      mockTurmasRepository.findByCode.mockResolvedValue({
        id: '1',
        codigo: '3A01',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTurmasRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as turmas filtradas pelo usuário', async () => {
      const mockTurmas = [{ id: '1', nome: 'Turma A' }];
      mockTurmasRepository.findAll.mockResolvedValue(mockTurmas);

      const user = { id: 'prof-1', perfil: 'professor' };
      const filtros = { nome: 'Turma' };
      const result = await service.findAll(filtros, user);

      expect(mockTurmasRepository.findAll).toHaveBeenCalledWith(filtros, user);
      expect(result).toEqual(mockTurmas);
    });
  });

  describe('findById', () => {
    it('deve retornar a turma quando encontrada por um admin', async () => {
      const mockTurma = { id: 't1', nome: 'Turma A', professor_id: 'prof-1' };
      mockTurmasRepository.findById.mockResolvedValue(mockTurma);

      const result = await service.findById('t1', {
        id: 'admin-1',
        perfil: 'admin',
      });

      expect(result).toEqual(mockTurma);
    });

    it('deve lançar NotFoundException se a turma não existir', async () => {
      mockTurmasRepository.findById.mockResolvedValue(null);

      await expect(
        service.findById('non-existent', { id: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se professor tentar acessar turma de outro professor', async () => {
      const mockTurma = {
        id: 't1',
        nome: 'Turma A',
        professor_id: 'prof-outro',
      };
      mockTurmasRepository.findById.mockResolvedValue(mockTurma);

      await expect(
        service.findById('t1', { id: 'prof-meu', perfil: 'professor' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se aluno tentar acessar turma em que não está matriculado', async () => {
      const mockTurma = { id: 't1', nome: 'Turma A', professor_id: 'prof-1' };
      mockTurmasRepository.findById.mockResolvedValue(mockTurma);
      mockTurmasRepository.verificarMatricula.mockResolvedValue(false);

      await expect(
        service.findById('t1', {
          id: 'aluno-1',
          perfil: 'aluno',
          turma_id: 'outra-turma',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve atualizar a turma com sucesso', async () => {
      const existing = { id: 't1', nome: 'Turma A', professor_id: 'prof-1' };
      const updated = {
        id: 't1',
        nome: 'Turma Atualizada',
        professor_id: 'prof-1',
      };

      mockTurmasRepository.findById.mockResolvedValue(existing);
      mockTurmasRepository.update.mockResolvedValue([updated]);

      const result = await service.update(
        't1',
        { nome: 'Turma Atualizada' },
        { id: 'prof-1', perfil: 'professor' },
      );

      expect(mockTurmasRepository.update).toHaveBeenCalledWith('t1', {
        nome: 'Turma Atualizada',
      });
      expect(result).toEqual(updated);
    });

    it('deve lançar NotFoundException se a turma não existir', async () => {
      mockTurmasRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('t-inexistente', { nome: 'X' }, { id: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se outro professor tentar atualizar a turma', async () => {
      const existing = { id: 't1', nome: 'Turma A', professor_id: 'prof-dono' };
      mockTurmasRepository.findById.mockResolvedValue(existing);

      await expect(
        service.update(
          't1',
          { nome: 'X' },
          { id: 'prof-intruso', perfil: 'professor' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deve remover a turma com sucesso', async () => {
      mockTurmasRepository.findById.mockResolvedValue({
        id: 't1',
        professor_id: 'prof-1',
      });
      mockTurmasRepository.remove.mockResolvedValue(1);

      await service.remove('t1', { id: 'prof-1', perfil: 'professor' });

      expect(mockTurmasRepository.remove).toHaveBeenCalledWith('t1');
    });

    it('deve lançar NotFoundException se a turma não for encontrada', async () => {
      mockTurmasRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('t-inexistente', { id: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se outro professor tentar remover a turma', async () => {
      mockTurmasRepository.findById.mockResolvedValue({
        id: 't1',
        professor_id: 'prof-dono',
      });

      await expect(
        service.remove('t1', { id: 'prof-intruso', perfil: 'professor' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('adicionarAluno', () => {
    const turma = { id: 't1', max_alunos: 30, professor_id: 'prof-1' };

    it('deve matricular um aluno com sucesso', async () => {
      mockTurmasRepository.findById.mockResolvedValue(turma);
      mockTurmasRepository.verificarMatricula.mockResolvedValue(false);
      mockTurmasRepository.countAlunos.mockResolvedValue(10);
      mockTurmasRepository.adicionarAluno.mockResolvedValue({
        message: 'Matrícula realizada',
      });

      const result = await service.adicionarAluno('t1', 'aluno-1', {
        id: 'prof-1',
        perfil: 'professor',
      });

      expect(mockTurmasRepository.adicionarAluno).toHaveBeenCalledWith(
        't1',
        'aluno-1',
      );
      expect(result).toBeDefined();
    });

    it('deve lançar NotFoundException se a turma não existir', async () => {
      mockTurmasRepository.findById.mockResolvedValue(null);

      await expect(
        service.adicionarAluno('t-none', 'aluno-1', { id: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se professor tentar adicionar aluno na turma de outro professor', async () => {
      mockTurmasRepository.findById.mockResolvedValue(turma);

      await expect(
        service.adicionarAluno('t1', 'aluno-1', {
          id: 'prof-intruso',
          perfil: 'professor',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ConflictException se o aluno já estiver matriculado', async () => {
      mockTurmasRepository.findById.mockResolvedValue(turma);
      mockTurmasRepository.verificarMatricula.mockResolvedValue(true);

      await expect(
        service.adicionarAluno('t1', 'aluno-1', {
          id: 'prof-1',
          perfil: 'professor',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar BadRequestException se a turma atingir a capacidade máxima', async () => {
      mockTurmasRepository.findById.mockResolvedValue(turma);
      mockTurmasRepository.verificarMatricula.mockResolvedValue(false);
      mockTurmasRepository.countAlunos.mockResolvedValue(30);

      await expect(
        service.adicionarAluno('t1', 'aluno-1', {
          id: 'prof-1',
          perfil: 'professor',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
