import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../usuarios.service';
import { UsuariosRepository } from '../usuarios.repository';

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
});
