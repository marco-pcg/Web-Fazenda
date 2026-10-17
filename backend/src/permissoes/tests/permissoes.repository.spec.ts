import { Test, TestingModule } from '@nestjs/testing';
import { PermissoesRepository } from '../permissoes.repository';

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
