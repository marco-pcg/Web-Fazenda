import { Test, TestingModule } from '@nestjs/testing';
import { TurmasController } from '../../turmas/turmas.controller';
import { TurmasService } from '../../turmas/turmas.service';
import { Reflector } from '@nestjs/core';

describe('TurmasController', () => {
  let controller: TurmasController;

  const mockTurmasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    adicionarAluno: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurmasController],
      providers: [
        {
          provide: TurmasService,
          useValue: mockTurmasService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<TurmasController>(TurmasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar service.create e retornar turma criada', async () => {
    const dto = {
      nome: 'Turma A',
      codigo: '3A01',
      ano: 2026,
      max_alunos: 25,
      professor_id: 'p1',
    };
    const expected = { id: 't1', ...dto };
    mockTurmasService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockTurmasService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findAll com filtros e user da request', async () => {
    const filtros = { nome: 'A' };
    const req = { user: { id: 'prof-1', perfil: 'professor' } };
    mockTurmasService.findAll.mockResolvedValue([]);

    const result = await controller.findAll(filtros, req);

    expect(mockTurmasService.findAll).toHaveBeenCalledWith(filtros, req.user);
    expect(result).toEqual([]);
  });

  it('deve chamar service.findById com id e user da request', async () => {
    const req = { user: { id: 'prof-1' } };
    const expected = { id: 't1', nome: 'Turma A' };
    mockTurmasService.findById.mockResolvedValue(expected);

    const result = await controller.findById('t1', req);

    expect(mockTurmasService.findById).toHaveBeenCalledWith('t1', req.user);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.update com id, dto e user da request', async () => {
    const dto = { nome: 'Turma B' };
    const req = { user: { id: 'prof-1' } };
    const expected = { id: 't1', nome: 'Turma B' };
    mockTurmasService.update.mockResolvedValue(expected);

    const result = await controller.update('t1', dto, req);

    expect(mockTurmasService.update).toHaveBeenCalledWith('t1', dto, req.user);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.remove com id e user da request', async () => {
    const req = { user: { id: 'prof-1' } };
    mockTurmasService.remove.mockResolvedValue(undefined);

    await controller.remove('t1', req);

    expect(mockTurmasService.remove).toHaveBeenCalledWith('t1', req.user);
  });

  it('deve chamar service.adicionarAluno com id, aluno_id e user da request', async () => {
    const dto = { aluno_id: 'aluno-1' };
    const req = { user: { id: 'prof-1' } };
    const expected = { message: 'Aluno adicionado' };
    mockTurmasService.adicionarAluno.mockResolvedValue(expected);

    const result = await controller.adicionarAluno('t1', dto, req);

    expect(mockTurmasService.adicionarAluno).toHaveBeenCalledWith(
      't1',
      'aluno-1',
      req.user,
    );
    expect(result).toEqual(expected);
  });
});
