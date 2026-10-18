import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesController } from '../../permissoes/permissoes.controller';
import { PermissoesService } from '../../permissoes/permissoes.service';
import { Reflector } from '@nestjs/core';

describe('PermissoesController', () => {
  let controller: PermissoesController;

  const mockPermissoesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissoesController],
      providers: [
        {
          provide: PermissoesService,
          useValue: mockPermissoesService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<PermissoesController>(PermissoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar service.create e retornar permissão criada', async () => {
    const dto = {
      nome: 'usuarios:criar',
      descricao: 'Criar usuário',
      modulo: 'usuarios',
      acao: 'criar',
    };
    const expected = { id: 'perm-1', ...dto };
    mockPermissoesService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockPermissoesService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findAll com filtros', async () => {
    const filtros = { modulo: 'usuarios' };
    mockPermissoesService.findAll.mockResolvedValue([]);

    const result = await controller.findAll(filtros);

    expect(mockPermissoesService.findAll).toHaveBeenCalledWith(filtros);
    expect(result).toEqual([]);
  });

  it('deve chamar service.findById com id', async () => {
    const expected = { id: 'perm-1', nome: 'usuarios:criar' };
    mockPermissoesService.findById.mockResolvedValue(expected);

    const result = await controller.findById('perm-1');

    expect(mockPermissoesService.findById).toHaveBeenCalledWith('perm-1');
    expect(result).toEqual(expected);
  });

  it('deve chamar service.update com id e dto', async () => {
    const dto = { descricao: 'Nova descrição' };
    const expected = { id: 'perm-1', ...dto };
    mockPermissoesService.update.mockResolvedValue(expected);

    const result = await controller.update('perm-1', dto);

    expect(mockPermissoesService.update).toHaveBeenCalledWith('perm-1', dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.remove com id', async () => {
    mockPermissoesService.remove.mockResolvedValue(undefined);

    await controller.remove('perm-1');

    expect(mockPermissoesService.remove).toHaveBeenCalledWith('perm-1');
  });
});
