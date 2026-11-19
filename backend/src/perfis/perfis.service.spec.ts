import { Test, TestingModule } from '@nestjs/testing';
import { PerfisRepository } from './perfis.repository';
import { PerfisService } from './perfis.service';

describe('PerfisService', () => {
  let service: PerfisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfisService,
        { provide: PerfisRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<PerfisService>(PerfisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
