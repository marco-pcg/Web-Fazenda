import { Test, TestingModule } from '@nestjs/testing';
import { PerfisRepository } from '../../perfis/perfis.repository';

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
      orderBy: jest.fn().mockReturnThis(),
    })),
    {
      fn: { now: jest.fn(() => 'NOW()') },
    },
  ),
}));

describe('PerfisRepository', () => {
  let repository: PerfisRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfisRepository],
    }).compile();

    repository = module.get<PerfisRepository>(PerfisRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
