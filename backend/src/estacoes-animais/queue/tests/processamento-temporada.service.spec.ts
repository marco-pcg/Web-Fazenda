import { Test, TestingModule } from '@nestjs/testing';
import { ProcessamentoTemporadaService } from '../processamento-temporada.service';
import { TemporadasRepository } from '../../temporadas/temporadas.repository';
import { TemporadasService } from '../../temporadas/temporadas.service';
import { EstacoesRepository } from '../../estacoes/estacoes.repository';
import { EventosClimaticosRepository } from '../../eventos-climaticos/eventos-climaticos.repository';
import { EventosClimaticosService } from '../../eventos-climaticos/eventos-climaticos.service';
import { RebanhosRepository } from '../../rebanhos/rebanhos.repository';
import { AlimentacoesRepository } from '../../rebanhos/alimentacoes.repository';
import { AlimentacoesService } from '../../rebanhos/alimentacoes.service';
import { EspeciesRepository } from '../../especies/especies.repository';
import { ProducoesRepository } from '../../producoes/producoes.repository';
import { FAZENDAS_PORT } from '../../ports/fazendas.port';
import { ESTOQUE_PORT } from '../../ports/estoque.port';
import { AlvoEvento, StatusTemporada } from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({
  database: {
    transaction: (callback: (trx: string) => unknown) => callback('trx-falso'),
  },
}));

describe('ProcessamentoTemporadaService', () => {
  let service: ProcessamentoTemporadaService;

  const mockTemporadasRepository = { findById: jest.fn(), update: jest.fn() };
  const mockTemporadasService = {
    ativar: jest.fn(),
    encerrarEAtivarProxima: jest.fn(),
  };
  const mockEstacoesRepository = { findById: jest.fn() };
  const mockEventosRepository = { listarAtivosPorTurma: jest.fn() };
  const mockEventosService = { encerrarAtivosDaTemporada: jest.fn() };
  const mockRebanhosRepository = {
    listarPorFazendas: jest.fn(),
    update: jest.fn(),
  };
  const mockAlimentacoesRepository = { findDoRebanhoNaTemporada: jest.fn() };
  const mockAlimentacoesService = { alimentarRebanho: jest.fn() };
  const mockEspeciesRepository = { findById: jest.fn() };
  const mockProducoesRepository = {
    findDoRebanhoNaTemporada: jest.fn(),
    insert: jest.fn(),
  };
  const mockFazendasPort = { listarPorTurma: jest.fn() };
  const mockEstoquePort = { creditarProduto: jest.fn() };

  const temporadaEmProcessamento = {
    id: 'id-temporada',
    turma_id: 'id-turma',
    estacao_id: 'id-primavera',
    status: StatusTemporada.PROCESSANDO,
  };

  const galinhas = {
    id: 'id-galinhas',
    fazenda_id: 'id-fazenda',
    especie_id: 'id-galinha',
    quantidade: 100,
  };

  const galinha = {
    id: 'id-galinha',
    produto: 'ovos',
    producao_por_animal: '8.0000',
    taxa_crescimento: '0.1500',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTemporadasRepository.findById.mockResolvedValue(
      temporadaEmProcessamento,
    );
    mockFazendasPort.listarPorTurma.mockResolvedValue([{ id: 'id-fazenda' }]);
    mockRebanhosRepository.listarPorFazendas.mockResolvedValue([galinhas]);
    mockEstacoesRepository.findById.mockResolvedValue({
      id: 'id-primavera',
      fator_produtividade: '1.1000',
    });
    mockEventosRepository.listarAtivosPorTurma.mockResolvedValue([]);
    mockEspeciesRepository.findById.mockResolvedValue(galinha);
    mockAlimentacoesRepository.findDoRebanhoNaTemporada.mockResolvedValue(
      undefined,
    );
    mockAlimentacoesService.alimentarRebanho.mockResolvedValue({
      proporcao_atendida: 1,
    });
    mockProducoesRepository.findDoRebanhoNaTemporada.mockResolvedValue(
      undefined,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessamentoTemporadaService,
        { provide: TemporadasRepository, useValue: mockTemporadasRepository },
        { provide: TemporadasService, useValue: mockTemporadasService },
        { provide: EstacoesRepository, useValue: mockEstacoesRepository },
        {
          provide: EventosClimaticosRepository,
          useValue: mockEventosRepository,
        },
        { provide: EventosClimaticosService, useValue: mockEventosService },
        { provide: RebanhosRepository, useValue: mockRebanhosRepository },
        {
          provide: AlimentacoesRepository,
          useValue: mockAlimentacoesRepository,
        },
        { provide: AlimentacoesService, useValue: mockAlimentacoesService },
        { provide: EspeciesRepository, useValue: mockEspeciesRepository },
        { provide: ProducoesRepository, useValue: mockProducoesRepository },
        { provide: FAZENDAS_PORT, useValue: mockFazendasPort },
        { provide: ESTOQUE_PORT, useValue: mockEstoquePort },
      ],
    }).compile();

    service = module.get<ProcessamentoTemporadaService>(
      ProcessamentoTemporadaService,
    );
  });

  it('não faz nada quando a temporada não está em processamento', async () => {
    mockTemporadasRepository.findById.mockResolvedValue({
      ...temporadaEmProcessamento,
      status: StatusTemporada.ATIVA,
    });

    await service.processar('id-temporada', StatusTemporada.ATIVA);

    expect(mockTemporadasService.ativar).not.toHaveBeenCalled();
    expect(mockFazendasPort.listarPorTurma).not.toHaveBeenCalled();
    expect(mockTemporadasService.encerrarEAtivarProxima).not.toHaveBeenCalled();
  });

  it('só ativa quando a temporada era planejada', async () => {
    await service.processar('id-temporada', StatusTemporada.PLANEJADA);

    expect(mockTemporadasService.ativar).toHaveBeenCalledWith(
      'id-temporada',
      'trx-falso',
    );
    expect(mockFazendasPort.listarPorTurma).not.toHaveBeenCalled();
    expect(mockTemporadasService.encerrarEAtivarProxima).not.toHaveBeenCalled();
  });

  it('alimenta, produz, cresce e fecha a temporada nessa ordem', async () => {
    const resumo = await service.processar(
      'id-temporada',
      StatusTemporada.ATIVA,
    );

    expect(mockAlimentacoesService.alimentarRebanho).toHaveBeenCalledWith(
      'id-galinhas',
      { trx: 'trx-falso', temporada_id: 'id-temporada' },
    );
    expect(mockProducoesRepository.insert).toHaveBeenCalledWith(
      {
        rebanho_id: 'id-galinhas',
        temporada_id: 'id-temporada',
        produto: 'ovos',
        quantidade: 880,
        fator_aplicado: 1.1,
      },
      'trx-falso',
    );
    expect(mockEstoquePort.creditarProduto).toHaveBeenCalledWith(
      'id-fazenda',
      'ovos',
      880,
      'trx-falso',
    );
    expect(mockRebanhosRepository.update).toHaveBeenCalledWith(
      'id-galinhas',
      { quantidade: 115 },
      'trx-falso',
    );
    expect(mockEventosService.encerrarAtivosDaTemporada).toHaveBeenCalledWith(
      'id-temporada',
      'trx-falso',
    );
    expect(mockTemporadasService.encerrarEAtivarProxima).toHaveBeenCalledWith(
      'id-temporada',
      'trx-falso',
    );

    const ordem = [
      mockAlimentacoesService.alimentarRebanho,
      mockProducoesRepository.insert,
      mockEstoquePort.creditarProduto,
      mockRebanhosRepository.update,
      mockEventosService.encerrarAtivosDaTemporada,
      mockTemporadasService.encerrarEAtivarProxima,
    ].map((mock) => mock.mock.invocationCallOrder[0]);
    expect(ordem).toEqual([...ordem].sort((a, b) => a - b));

    expect(resumo).toEqual({
      temporada_id: 'id-temporada',
      status_anterior: StatusTemporada.ATIVA,
      rebanhos_processados: 1,
      producoes_geradas: 1,
      rebanhos_subnutridos: 0,
    });
  });

  it('produz pela metade e não cresce quando a ração é parcial', async () => {
    mockAlimentacoesService.alimentarRebanho.mockResolvedValue({
      proporcao_atendida: 0.5,
    });

    const resumo = await service.processar(
      'id-temporada',
      StatusTemporada.ATIVA,
    );

    expect(mockProducoesRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: 440, fator_aplicado: 0.55 }),
      'trx-falso',
    );
    expect(mockRebanhosRepository.update).not.toHaveBeenCalled();
    expect(resumo.rebanhos_subnutridos).toBe(1);
  });

  it('multiplica os eventos de produtividade e ignora os de água', async () => {
    mockEventosRepository.listarAtivosPorTurma.mockResolvedValue([
      { alvo: AlvoEvento.PRODUTIVIDADE, multiplicador: '1.2000' },
      { alvo: AlvoEvento.AGUA, multiplicador: '0.5000' },
    ]);

    await service.processar('id-temporada', StatusTemporada.ATIVA);

    expect(mockProducoesRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: 1056, fator_aplicado: 1.32 }),
      'trx-falso',
    );
  });

  it('usa a alimentação já feita na temporada sem alimentar de novo', async () => {
    mockAlimentacoesRepository.findDoRebanhoNaTemporada.mockResolvedValue({
      proporcao_atendida: '0.5000',
    });

    await service.processar('id-temporada', StatusTemporada.ATIVA);

    expect(mockAlimentacoesService.alimentarRebanho).not.toHaveBeenCalled();
    expect(mockProducoesRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: 440 }),
      'trx-falso',
    );
  });

  it('ignora rebanhos sem animais', async () => {
    mockRebanhosRepository.listarPorFazendas.mockResolvedValue([
      { ...galinhas, quantidade: 0 },
    ]);

    const resumo = await service.processar(
      'id-temporada',
      StatusTemporada.ATIVA,
    );

    expect(mockAlimentacoesService.alimentarRebanho).not.toHaveBeenCalled();
    expect(mockProducoesRepository.insert).not.toHaveBeenCalled();
    expect(resumo.rebanhos_processados).toBe(0);
    expect(mockTemporadasService.encerrarEAtivarProxima).toHaveBeenCalled();
  });

  it('não duplica a produção já existente', async () => {
    mockProducoesRepository.findDoRebanhoNaTemporada.mockResolvedValue({
      id: 'producao-existente',
    });

    const resumo = await service.processar(
      'id-temporada',
      StatusTemporada.ATIVA,
    );

    expect(mockProducoesRepository.insert).not.toHaveBeenCalled();
    expect(mockEstoquePort.creditarProduto).not.toHaveBeenCalled();
    expect(resumo.producoes_geradas).toBe(0);
  });

  it('só fecha a temporada quando a turma não tem fazendas', async () => {
    mockFazendasPort.listarPorTurma.mockResolvedValue([]);
    mockRebanhosRepository.listarPorFazendas.mockResolvedValue([]);

    await service.processar('id-temporada', StatusTemporada.ATIVA);

    expect(mockRebanhosRepository.listarPorFazendas).toHaveBeenCalledWith(
      [],
      'trx-falso',
    );
    expect(mockAlimentacoesService.alimentarRebanho).not.toHaveBeenCalled();
    expect(mockEventosService.encerrarAtivosDaTemporada).toHaveBeenCalled();
    expect(mockTemporadasService.encerrarEAtivarProxima).toHaveBeenCalled();
  });

  it('repassa o erro e não fecha a temporada quando algo falha no meio', async () => {
    mockEstoquePort.creditarProduto.mockRejectedValue(
      new Error('falha no estoque'),
    );

    await expect(
      service.processar('id-temporada', StatusTemporada.ATIVA),
    ).rejects.toThrow('falha no estoque');
    expect(mockTemporadasService.encerrarEAtivarProxima).not.toHaveBeenCalled();
  });

  describe('reverterFalhaDefinitiva', () => {
    it('volta o status quando a temporada ainda está em processamento', async () => {
      await service.reverterFalhaDefinitiva(
        'id-temporada',
        StatusTemporada.ATIVA,
      );

      expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
        'id-temporada',
        { status: StatusTemporada.ATIVA },
      );
    });

    it('não mexe na temporada que já saiu do processamento', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...temporadaEmProcessamento,
        status: StatusTemporada.ENCERRADA,
      });

      await service.reverterFalhaDefinitiva(
        'id-temporada',
        StatusTemporada.ATIVA,
      );

      expect(mockTemporadasRepository.update).not.toHaveBeenCalled();
    });
  });
});
