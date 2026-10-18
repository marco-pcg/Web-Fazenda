import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Knex } from 'knex';
import { AlimentacoesService } from '../alimentacoes.service';
import { RebanhosRepository } from '../rebanhos.repository';
import { AlimentacoesRepository } from '../alimentacoes.repository';
import { EspeciesRepository } from '../../especies/especies.repository';
import { TemporadasRepository } from '../../temporadas/temporadas.repository';
import { FAZENDAS_PORT } from '../../ports/fazendas.port';
import { ESTOQUE_PORT } from '../../ports/estoque.port';
import { SaudeRebanho } from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({
  database: {
    transaction: (callback: (trx: string) => unknown) => callback('trx-falso'),
  },
}));

describe('AlimentacoesService', () => {
  let service: AlimentacoesService;
  const qualquerData: unknown = expect.any(Date);

  const mockRebanhosRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockAlimentacoesRepository = {
    findDoRebanhoNaTemporada: jest.fn(),
    insert: jest.fn(),
  };

  const mockEspeciesRepository = {
    findById: jest.fn(),
  };

  const mockTemporadasRepository = {
    findAtivaDaTurma: jest.fn(),
  };

  const mockFazendasPort = {
    buscarPorId: jest.fn(),
  };

  const mockEstoquePort = {
    obterRacao: jest.fn(),
    consumirRacao: jest.fn(),
  };

  const rebanho = {
    id: 'id-rebanho',
    fazenda_id: 'id-fazenda',
    especie_id: 'id-galinha',
    quantidade: 100,
    saude: SaudeRebanho.SAUDAVEL,
    ultima_alimentacao_em: null,
    created_at: new Date(),
  };

  const galinha = {
    id: 'id-galinha',
    nome: 'Galinha',
    consumo_racao_por_animal: '4.0000',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRebanhosRepository.findById.mockResolvedValue(rebanho);
    mockEspeciesRepository.findById.mockResolvedValue(galinha);
    mockFazendasPort.buscarPorId.mockResolvedValue({
      id: 'id-fazenda',
      nome: 'Fazenda',
      turmaId: null,
      usuarioId: null,
    });
    mockAlimentacoesRepository.findDoRebanhoNaTemporada.mockResolvedValue(
      undefined,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlimentacoesService,
        { provide: RebanhosRepository, useValue: mockRebanhosRepository },
        {
          provide: AlimentacoesRepository,
          useValue: mockAlimentacoesRepository,
        },
        { provide: EspeciesRepository, useValue: mockEspeciesRepository },
        { provide: TemporadasRepository, useValue: mockTemporadasRepository },
        { provide: FAZENDAS_PORT, useValue: mockFazendasPort },
        { provide: ESTOQUE_PORT, useValue: mockEstoquePort },
      ],
    }).compile();

    service = module.get<AlimentacoesService>(AlimentacoesService);
  });

  it('alimenta por completo quando há ração suficiente', async () => {
    mockEstoquePort.obterRacao.mockResolvedValue(1000);

    const resultado = await service.alimentarRebanho('id-rebanho');

    expect(resultado).toEqual({
      rebanho_id: 'id-rebanho',
      racao_necessaria: 400,
      racao_fornecida: 400,
      proporcao_atendida: 1,
      saude: SaudeRebanho.SAUDAVEL,
    });
    expect(mockEstoquePort.consumirRacao).toHaveBeenCalledWith(
      'id-fazenda',
      400,
      'trx-falso',
    );
    expect(mockAlimentacoesRepository.insert).toHaveBeenCalledWith(
      {
        rebanho_id: 'id-rebanho',
        temporada_id: null,
        racao_necessaria: 400,
        racao_fornecida: 400,
        proporcao_atendida: 1,
        subnutrido: false,
      },
      'trx-falso',
    );
  });

  it('deixa o rebanho subnutrido quando a ração é parcial', async () => {
    mockEstoquePort.obterRacao.mockResolvedValue(100);

    const resultado = await service.alimentarRebanho('id-rebanho');

    expect(resultado.racao_fornecida).toBe(100);
    expect(resultado.proporcao_atendida).toBe(0.25);
    expect(resultado.saude).toBe(SaudeRebanho.SUBNUTRIDO);
    expect(mockEstoquePort.consumirRacao).toHaveBeenCalledWith(
      'id-fazenda',
      100,
      'trx-falso',
    );
    expect(mockRebanhosRepository.update).toHaveBeenCalledWith(
      'id-rebanho',
      { saude: SaudeRebanho.SUBNUTRIDO, ultima_alimentacao_em: qualquerData },
      'trx-falso',
    );
  });

  it('não consome nada quando o estoque está zerado', async () => {
    mockEstoquePort.obterRacao.mockResolvedValue(0);

    const resultado = await service.alimentarRebanho('id-rebanho');

    expect(resultado.proporcao_atendida).toBe(0);
    expect(resultado.saude).toBe(SaudeRebanho.SUBNUTRIDO);
    expect(mockEstoquePort.consumirRacao).not.toHaveBeenCalled();
  });

  it('recupera um rebanho subnutrido quando a ração é suficiente', async () => {
    mockRebanhosRepository.findById.mockResolvedValue({
      ...rebanho,
      saude: SaudeRebanho.SUBNUTRIDO,
    });
    mockEstoquePort.obterRacao.mockResolvedValue(1000);

    const resultado = await service.alimentarRebanho('id-rebanho');

    expect(resultado.saude).toBe(SaudeRebanho.SAUDAVEL);
    expect(mockRebanhosRepository.update).toHaveBeenCalledWith(
      'id-rebanho',
      { saude: SaudeRebanho.SAUDAVEL, ultima_alimentacao_em: qualquerData },
      'trx-falso',
    );
  });

  it('retorna 422 para rebanho sem animais', async () => {
    mockRebanhosRepository.findById.mockResolvedValue({
      ...rebanho,
      quantidade: 0,
    });

    await expect(service.alimentarRebanho('id-rebanho')).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('retorna 409 quando o rebanho já foi alimentado na temporada', async () => {
    mockAlimentacoesRepository.findDoRebanhoNaTemporada.mockResolvedValue({
      id: 'alimentacao-anterior',
    });

    await expect(
      service.alimentarRebanho('id-rebanho', { temporada_id: 'id-temporada' }),
    ).rejects.toThrow(ConflictException);
    expect(mockEstoquePort.consumirRacao).not.toHaveBeenCalled();
  });

  it('usa a temporada ativa da turma da fazenda', async () => {
    mockFazendasPort.buscarPorId.mockResolvedValue({
      id: 'id-fazenda',
      nome: 'Fazenda',
      turmaId: 'id-turma',
      usuarioId: 'id-aluno',
    });
    mockTemporadasRepository.findAtivaDaTurma.mockResolvedValue({
      id: 'id-temporada-ativa',
    });
    mockEstoquePort.obterRacao.mockResolvedValue(1000);

    await service.alimentarRebanho('id-rebanho');

    expect(mockTemporadasRepository.findAtivaDaTurma).toHaveBeenCalledWith(
      'id-turma',
      'trx-falso',
    );
    expect(mockAlimentacoesRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ temporada_id: 'id-temporada-ativa' }),
      'trx-falso',
    );
  });

  it('usa a temporada e a transação recebidas nas opções', async () => {
    const trxRecebida = {} as Knex.Transaction;
    mockEstoquePort.obterRacao.mockResolvedValue(1000);

    await service.alimentarRebanho('id-rebanho', {
      trx: trxRecebida,
      temporada_id: 'id-temporada',
    });

    expect(mockFazendasPort.buscarPorId).not.toHaveBeenCalled();
    expect(mockAlimentacoesRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ temporada_id: 'id-temporada' }),
      trxRecebida,
    );
  });

  it('converte com Number os decimais da espécie antes da conta', async () => {
    mockEspeciesRepository.findById.mockResolvedValue({
      ...galinha,
      consumo_racao_por_animal: '2.5000',
    });
    mockRebanhosRepository.findById.mockResolvedValue({
      ...rebanho,
      quantidade: 3,
    });
    mockEstoquePort.obterRacao.mockResolvedValue(1000);

    const resultado = await service.alimentarRebanho('id-rebanho');

    expect(resultado.racao_necessaria).toBe(7.5);
  });
});
