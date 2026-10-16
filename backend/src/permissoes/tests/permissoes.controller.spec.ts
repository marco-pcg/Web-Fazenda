import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesController } from '../permissoes.controller';
import { PermissoesService } from '../permissoes.service';

describe('PermissoesController', () => {
  let controller: PermissoesController;
  const service = {
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
      providers: [{ provide: PermissoesService, useValue: service }],
    }).compile();

    controller = module.get<PermissoesController>(PermissoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates permission lookup by id', async () => {
    service.findById.mockResolvedValue({ id: 'permission-id' });

    await expect(controller.findById('permission-id')).resolves.toEqual({
      id: 'permission-id',
    });
    expect(service.findById).toHaveBeenCalledWith('permission-id');
  });
});
