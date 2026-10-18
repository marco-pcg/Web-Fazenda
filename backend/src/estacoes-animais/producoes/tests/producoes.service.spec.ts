import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProducoesService } from '../producoes.service';
import { ProducoesRepository } from '../producoes.repository';
import { FAZENDAS_PORT } from '../../ports/fazendas.port';

jest.mock('../../../db/knex-connection', () => ({ database: jest.fn() }));

describe('ProducoesService', () => {
  let service: ProducoesService;

  const mockProducoesRepository = {
    listar: jest.fn(),
  };

  const mockFazendasPort = {
    listarPorUsuario: jest.fn(),
  };

  const admin = {
    id: 'id-admin',
    email: 'admin@teste.com',
    perfil: 'admin',
    permissoes: [],
  };
  const aluno = {
    id: 'id-aluno',
    email: 'aluno@teste.com',
    perfil: 'aluno',
    permissoes: [],
  };

  const producaoDoBanco = {
    id: 'id-producao',
    rebanho_id: 'id-rebanho',
    temporada_id: 'id-temporada',
    produto: 'ovos',
    quantidade: '800.0000',
    fator_aplicado: '1.1000',
    created_at: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockProducoesRepository.listar.mockResolvedValue({
      data: [producaoDoBanco],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducoesService,
        { provide: ProducoesRepository, useValue: mockProducoesRepository },
        { provide: FAZENDAS_PORT, useValue: mockFazendasPort },
      ],
    }).compile();

    service = module.get<ProducoesService>(ProducoesService);
  });

  it('lista tudo para o admin e converte os decimais', async () => {
    const resultado = await service.listar({ page: 1, limit: 10 }, admin);

    expect(mockProducoesRepository.listar).toHaveBeenCalledWith(
      expect.objectContaining({ fazenda_ids: undefined }),
      1,
      10,
    );
    expect(resultado.data[0].quantidade).toBe(800);
    expect(resultado.data[0].fator_aplicado).toBe(1.1);
  });

  it('usa as fazendas do aluno', async () => {
    mockFazendasPort.listarPorUsuario.mockResolvedValue([{ id: 'fazenda-1' }]);

    await service.listar({ page: 1, limit: 10 }, aluno);

    expect(mockProducoesRepository.listar).toHaveBeenCalledWith(
      expect.objectContaining({ fazenda_ids: ['fazenda-1'] }),
      1,
      10,
    );
  });

  it('devolve lista vazia para aluno sem fazendas', async () => {
    mockFazendasPort.listarPorUsuario.mockResolvedValue([]);

    const resultado = await service.listar({ page: 1, limit: 10 }, aluno);

    expect(resultado.data).toEqual([]);
    expect(mockProducoesRepository.listar).not.toHaveBeenCalled();
  });

  it('retorna 400 quando a data inicial é maior que a final', async () => {
    await expect(
      service.listar(
        { data_inicio: '2026-12-01', data_fim: '2026-11-01' },
        admin,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
