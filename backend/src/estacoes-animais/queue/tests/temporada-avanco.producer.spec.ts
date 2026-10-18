import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { TemporadaAvancoProducer } from '../temporada-avanco.producer';
import { TemporadasRepository } from '../../temporadas/temporadas.repository';
import {
  FILA_ESTACOES_ANIMAIS,
  JOB_AVANCAR_TEMPORADA,
} from '../queue.constants';
import { StatusTemporada } from '../../../common/enums/enums';

describe('TemporadaAvancoProducer', () => {
  let producer: TemporadaAvancoProducer;

  const mockFila = {
    add: jest.fn(),
  };

  const mockTemporadasRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemporadaAvancoProducer,
        { provide: getQueueToken(FILA_ESTACOES_ANIMAIS), useValue: mockFila },
        { provide: TemporadasRepository, useValue: mockTemporadasRepository },
      ],
    }).compile();

    producer = module.get<TemporadaAvancoProducer>(TemporadaAvancoProducer);
  });

  it('coloca o job na fila com id fixo, tentativas e backoff', async () => {
    mockFila.add.mockResolvedValue({ id: 'avancar-id-temporada-ATIVA' });

    const jobId = await producer.enfileirar(
      'id-temporada',
      StatusTemporada.ATIVA,
    );

    expect(mockFila.add).toHaveBeenCalledWith(
      JOB_AVANCAR_TEMPORADA,
      { temporada_id: 'id-temporada', status_anterior: StatusTemporada.ATIVA },
      {
        jobId: 'avancar-id-temporada-ATIVA',
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      },
    );
    expect(jobId).toBe('avancar-id-temporada-ATIVA');
    expect(mockTemporadasRepository.update).not.toHaveBeenCalled();
  });

  it('volta o status e retorna 503 quando a fila está fora do ar', async () => {
    mockFila.add.mockRejectedValue(new Error('Redis fora do ar'));

    await expect(
      producer.enfileirar('id-temporada', StatusTemporada.PLANEJADA),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
      'id-temporada',
      { status: StatusTemporada.PLANEJADA },
    );
  });
});
