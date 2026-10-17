import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from '../../usuarios/usuarios.controller';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { Reflector } from '@nestjs/core';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const mockUsuariosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar service.create e retornar o usuário criado', async () => {
    const dto = {
      nome: 'João',
      email: 'joao@teste.com',
      senha: '123',
      perfil_id: 'p1',
    };
    const expected = { id: 'u1', nome: 'João', email: 'joao@teste.com' };
    mockUsuariosService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockUsuariosService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findAll e retornar a lista paginada', async () => {
    const filtros = { page: 1, limit: 10 };
    const expected = {
      dados: [],
      meta: { total: 0, page: 1, limit: 10, lastPage: 0 },
    };
    mockUsuariosService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(filtros);

    expect(mockUsuariosService.findAll).toHaveBeenCalledWith(filtros);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findById e retornar o usuário', async () => {
    const expected = { id: 'u1', nome: 'João' };
    mockUsuariosService.findById.mockResolvedValue(expected);

    const result = await controller.findById('u1');

    expect(mockUsuariosService.findById).toHaveBeenCalledWith('u1');
    expect(result).toEqual(expected);
  });

  it('deve chamar service.findByEmail e retornar o usuário', async () => {
    const expected = { id: 'u1', email: 'joao@teste.com' };
    mockUsuariosService.findByEmail.mockResolvedValue(expected);

    const result = await controller.findByEmail('joao@teste.com');

    expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith(
      'joao@teste.com',
    );
    expect(result).toEqual(expected);
  });

  it('deve chamar service.update e retornar o usuário atualizado', async () => {
    const dto = { nome: 'João Atualizado' };
    const expected = { id: 'u1', nome: 'João Atualizado' };
    mockUsuariosService.update.mockResolvedValue(expected);

    const result = await controller.update('u1', dto);

    expect(mockUsuariosService.update).toHaveBeenCalledWith('u1', dto);
    expect(result).toEqual(expected);
  });

  it('deve chamar service.remove com o id especificado', async () => {
    mockUsuariosService.remove.mockResolvedValue(undefined);

    await controller.remove('u1');

    expect(mockUsuariosService.remove).toHaveBeenCalledWith('u1');
  });
});
