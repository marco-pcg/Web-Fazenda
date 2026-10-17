import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesRepository } from '../../permissoes/permissoes.repository';

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
      orderBy: jest.fn().mockReturnThis(),
    })),
    {
      fn: { now: jest.fn(() => 'NOW()') },
    },
  ),
}));

describe('PermissoesRepository', () => {
  let repository: PermissoesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissoesRepository],
    }).compile();

    repository = module.get<PermissoesRepository>(PermissoesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
