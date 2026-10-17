import { Test, TestingModule } from '@nestjs/testing';
import { TurmasRepository } from '../turmas.repository';

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
