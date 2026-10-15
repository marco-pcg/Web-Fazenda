import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TentativaSubmetidaEvent } from '../tentativa-submetida.event.js';
import { IRANKING_READ_REPOSITORY } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';
import type { IRankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository.interface.js';

@EventsHandler(TentativaSubmetidaEvent)
export class TentativaSubmetidaEventHandler implements IEventHandler<TentativaSubmetidaEvent> {
  constructor(@Inject(IRANKING_READ_REPOSITORY) private readonly rankingReadRepo: IRankingReadRepository) {}

  async handle(event: TentativaSubmetidaEvent) {
    // Sincroniza e atualiza a Tabela de Leitura (RankingReadModel)
    await this.rankingReadRepo.atualizarRanking({
      alunoId: event.alunoId,
      problemaId: event.problemaId,
      novaNota: event.nota,
    });
  }
}
