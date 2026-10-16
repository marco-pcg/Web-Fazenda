import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from '../usuarios.controller';
import { UsuariosService } from '../usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  const service = {
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
      providers: [{ provide: UsuariosService, useValue: service }],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates user creation to the service', async () => {
    service.create.mockResolvedValue({ id: 'user-id' });
    const dto = {
      nome: 'Ana',
      email: 'ana@example.com',
      senha: 'secret',
      perfil_id: 'profile-id',
    };

    await expect(controller.create(dto)).resolves.toEqual({ id: 'user-id' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates paginated listing with query filters', async () => {
    const filters = { page: 2, limit: 10 };
    service.findAll.mockResolvedValue({ dados: [], meta: {} });

    await controller.findAll(filters);

    expect(service.findAll).toHaveBeenCalledWith(filters);
  });
});
