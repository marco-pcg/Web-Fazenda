import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EstacoesService } from '../estacoes.service';
import { EstacoesRepository } from '../estacoes.repository';
import { NomeEstacao } from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({ database: jest.fn() }));

describe('EstacoesService', () => {
  let service: EstacoesService;

  const mockEstacoesRepository = {
    listar: jest.fn(),
    findByNome: jest.fn(),
    findByOrdem: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstacoesService,
        {
          provide: EstacoesRepository,
          useValue: mockEstacoesRepository,
        },
      ],
    }).compile();

    service = module.get<EstacoesService>(EstacoesService);
  });

  it('cria uma estação com sucesso', async () => {
    mockEstacoesRepository.findByNome.mockResolvedValue(undefined);
    mockEstacoesRepository.findByOrdem.mockResolvedValue(undefined);
    mockEstacoesRepository.insert.mockResolvedValue({
      id: '1',
      nome: NomeEstacao.PRIMAVERA,
      ordem: 1,
      fator_produtividade: '1.1000',
      fator_agua: '1.0000',
    });

    const estacao = await service.criar({
      nome: NomeEstacao.PRIMAVERA,
      ordem: 1,
      fator_produtividade: 1.1,
    });

    expect(estacao.fator_produtividade).toBe(1.1);
    expect(estacao.fator_agua).toBe(1);
    expect(mockEstacoesRepository.insert).toHaveBeenCalledWith({
      nome: NomeEstacao.PRIMAVERA,
      ordem: 1,
      fator_produtividade: 1.1,
      fator_agua: 1,
    });
  });

  it('não cria estação com nome repetido', async () => {
    mockEstacoesRepository.findByNome.mockResolvedValue({ id: '1' });

    await expect(
      service.criar({ nome: NomeEstacao.VERAO, ordem: 2 }),
    ).rejects.toThrow(ConflictException);
    expect(mockEstacoesRepository.insert).not.toHaveBeenCalled();
  });

  it('não cria estação com ordem repetida', async () => {
    mockEstacoesRepository.findByNome.mockResolvedValue(undefined);
    mockEstacoesRepository.findByOrdem.mockResolvedValue({ id: '1' });

    await expect(
      service.criar({ nome: NomeEstacao.VERAO, ordem: 2 }),
    ).rejects.toThrow(ConflictException);
    expect(mockEstacoesRepository.insert).not.toHaveBeenCalled();
  });

  it('lista as estações com data e meta', async () => {
    mockEstacoesRepository.listar.mockResolvedValue({
      data: [
        {
          id: '1',
          nome: NomeEstacao.INVERNO,
          ordem: 4,
          fator_produtividade: '0.7000',
          fator_agua: '0.7000',
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const resultado = await service.listar({ pagina: 1, limite: 10 });

    expect(resultado.data).toHaveLength(1);
    expect(resultado.data[0].fator_produtividade).toBe(0.7);
    expect(resultado.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
