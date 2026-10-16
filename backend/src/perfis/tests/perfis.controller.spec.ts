import { Test, TestingModule } from '@nestjs/testing';
import { PerfisController } from '../perfis.controller';
import { PerfisService } from '../perfis.service';
import { Reflector } from '@nestjs/core';

describe('PerfisController', () => {
  let controller: PerfisController;

  const mockPerfisService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    vincularPermissoes: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfisController],
      providers: [
        {
          provide: PerfisService,
          useValue: mockPerfisService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<PerfisController>(PerfisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
