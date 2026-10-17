import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosRepository } from '../../usuarios/usuarios.repository';

jest.mock('../../db/knex-connection', () => ({
  database: Object.assign(
    jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      join: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue({
        count: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue({ total: '0' }),
        }),
      }),
    })),
    {
      fn: { now: jest.fn(() => 'NOW()') },
    },
  ),
}));

describe('UsuariosRepository', () => {
  let repository: UsuariosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosRepository],
    }).compile();

    repository = module.get<UsuariosRepository>(UsuariosRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
