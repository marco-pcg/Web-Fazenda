import { Test, TestingModule } from '@nestjs/testing';
import { TurmasController } from '../turmas.controller';
import { TurmasService } from '../turmas.service';
import { Reflector } from '@nestjs/core';

describe('TurmasController', () => {
  let controller: TurmasController;

  const mockTurmasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    adicionarAluno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurmasController],
      providers: [
        {
          provide: TurmasService,
          useValue: mockTurmasService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<TurmasController>(TurmasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
