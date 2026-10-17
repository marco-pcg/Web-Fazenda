import { Test, TestingModule } from '@nestjs/testing';
import { TurmasRepository } from '../../turmas/turmas.repository';

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
      count: jest.fn().mockReturnThis(),
    })),
    {
      fn: { now: jest.fn(() => 'NOW()') },
    },
  ),
}));

describe('TurmasRepository', () => {
  let repository: TurmasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurmasRepository],
    }).compile();

    repository = module.get<TurmasRepository>(TurmasRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
