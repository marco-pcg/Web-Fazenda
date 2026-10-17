import { Test, TestingModule } from '@nestjs/testing';
import { PerfisRepository } from '../perfis.repository';

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
