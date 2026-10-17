import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosRepository } from '../usuarios.repository';

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
