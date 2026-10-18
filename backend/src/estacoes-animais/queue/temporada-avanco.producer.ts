import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TemporadasRepository } from '../temporadas/temporadas.repository';
import { StatusTemporada } from '../../common/enums/enums';
import {
  DadosAvancoTemporada,
  FILA_ESTACOES_ANIMAIS,
  JOB_AVANCAR_TEMPORADA,
} from './queue.constants';

@Injectable()
export class TemporadaAvancoProducer {
  constructor(
    @InjectQueue(FILA_ESTACOES_ANIMAIS)
    private readonly fila: Queue<DadosAvancoTemporada>,
    private readonly temporadasRepository: TemporadasRepository,
  ) {}

  async enfileirar(
    temporada_id: string,
    status_anterior: StatusTemporada,
  ): Promise<string> {
    try {
      const job = await this.fila.add(
        JOB_AVANCAR_TEMPORADA,
        { temporada_id, status_anterior },
        {
          jobId: `avancar-${temporada_id}-${status_anterior}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: false,
        },
      );
      return String(job.id);
    } catch {
      await this.temporadasRepository.update(temporada_id, {
        status: status_anterior,
      });
      throw new ServiceUnavailableException(
        'A fila de processamento está indisponível no momento. Tente novamente em instantes.',
      );
    }
  }
}
