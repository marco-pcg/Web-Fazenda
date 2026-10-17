import { Test, TestingModule } from '@nestjs/testing';
import { PerfisController } from '../../perfis/perfis.controller';
import { PerfisService } from '../../perfis/perfis.service';
import { Reflector } from '@nestjs/core';

describe('PerfisController', () => {
  let controller: PerfisController;

  const mockPerfisService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    vincularPermissoes: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfisController],
      providers: [
        {
          provide: PerfisService,
          useValue: mockPerfisService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<PerfisController>(PerfisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar service.create e retornar o perfil criado', async () => {
    const dto = { nome: 'Admin', descricao: 'Administrador' };
    const expected = { id: 'p1', ...dto };
    mockPerfisService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockPerfisService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findAll com filtros', async () => {
    const filtros = { nome: 'Admin' };
    mockPerfisService.findAll.mockResolvedValue([]);

    const result = await controller.findAll(filtros);

    expect(mockPerfisService.findAll).toHaveBeenCalledWith(filtros);
    expect(result).toEqual([]);
  });

  it('deve chamar service.findById e retornar perfil com permissões', async () => {
    const expected = { id: 'p1', nome: 'Admin', permissoes: [] };
    mockPerfisService.findById.mockResolvedValue(expected);

    const result = await controller.findById('p1');

    expect(mockPerfisService.findById).toHaveBeenCalledWith('p1');
    expect(result).toEqual(expected);
  });

  it('deve chamar service.vincularPermissoes com id e permissoes_ids', async () => {
    const dto = { permissoes_ids: ['perm-1', 'perm-2'] };
    const expected = { message: 'Permissões atualizadas com sucesso' };
    mockPerfisService.vincularPermissoes.mockResolvedValue(expected);

    const result = await controller.vincularPermissoes('p1', dto);

    expect(mockPerfisService.vincularPermissoes).toHaveBeenCalledWith(
      'p1',
      dto.permissoes_ids,
    );
    expect(result).toEqual(expected);
  });

  it('deve chamar service.update com id e dto', async () => {
    const dto = { nome: 'Admin Geral' };
    const expected = { id: 'p1', nome: 'Admin Geral' };
    mockPerfisService.update.mockResolvedValue(expected);

    const result = await controller.update('p1', dto);

    expect(mockPerfisService.update).toHaveBeenCalledWith('p1', dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.remove com id', async () => {
    mockPerfisService.remove.mockResolvedValue(undefined);

    await controller.remove('p1');

    expect(mockPerfisService.remove).toHaveBeenCalledWith('p1');
  });
});
