import { Test, TestingModule } from '@nestjs/testing';
import { TurmasRepository } from './turmas.repository';
import { TurmasService } from './turmas.service';

describe('TurmasService', () => {
  let service: TurmasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurmasService,
        { provide: TurmasRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<TurmasService>(TurmasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
