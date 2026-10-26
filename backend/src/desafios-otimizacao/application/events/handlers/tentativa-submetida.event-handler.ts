import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TentativaSubmetidaEvent } from '../tentativa-submetida.event';
import { RankingReadRepository } from '../../../infrastructure/repositories/ranking-read.repository';

@EventsHandler(TentativaSubmetidaEvent)
export class TentativaSubmetidaEventHandler implements IEventHandler<TentativaSubmetidaEvent> {
  constructor(private readonly rankingReadRepo: RankingReadRepository) {}

  async handle(event: TentativaSubmetidaEvent) {
    await this.rankingReadRepo.atualizarRanking({
      alunoId: event.alunoId,
      problemaId: event.problemaId,
      novaNota: event.nota,
    });
  }
}
