import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DadosAvancoTemporada, FILA_ESTACOES_ANIMAIS } from './queue.constants';
import {
  ProcessamentoTemporadaService,
  ResumoProcessamento,
} from './processamento-temporada.service';

@Processor(FILA_ESTACOES_ANIMAIS)
export class TemporadaAvancoProcessor extends WorkerHost {
  private readonly logger = new Logger(TemporadaAvancoProcessor.name);

  constructor(
    private readonly processamentoTemporadaService: ProcessamentoTemporadaService,
  ) {
    super();
  }

  process(job: Job<DadosAvancoTemporada>): Promise<ResumoProcessamento> {
    return this.processamentoTemporadaService.processar(
      job.data.temporada_id,
      job.data.status_anterior,
    );
  }

  @OnWorkerEvent('failed')
  async aoFalhar(job: Job<DadosAvancoTemporada> | undefined, erro: Error) {
    if (!job) {
      return;
    }

    const tentativas = job.opts.attempts || 1;
    if (job.attemptsMade < tentativas) {
      this.logger.warn(
        `Tentativa ${job.attemptsMade} de ${tentativas} falhou para a temporada ${job.data.temporada_id}: ${erro.message}`,
      );
      return;
    }

    await this.processamentoTemporadaService.reverterFalhaDefinitiva(
      job.data.temporada_id,
      job.data.status_anterior,
    );
    await job.remove();
  }
}
