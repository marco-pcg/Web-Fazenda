import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Tokens de Interfaces
import { IPROBLEMA_REPOSITORY } from './infrastructure/repositories/problema.repository.interface.js';
import { ITENTATIVA_REPOSITORY } from './infrastructure/repositories/tentativa.repository.interface.js';
import { IRANKING_READ_REPOSITORY } from './infrastructure/repositories/ranking-read.repository.interface.js';

// Adaptadores de persistência em memória; podem ser substituídos por Prisma sem alterar os handlers.
import { ProblemaRepository } from './infrastructure/repositories/problema.repository.js';
import { TentativaRepository } from './infrastructure/repositories/tentativa.repository.js';
import { RankingReadRepository } from './infrastructure/repositories/ranking-read.repository.js';
import { AvaliadorOtimizacaoService } from './domain/services/avaliador-otimizacao.service.js';
import { SubmeterTentativaHandler } from './application/commands/handlers/submeter-tentativa.handler.js';
import { CriarProblemaHandler } from './application/commands/handlers/criar-problema.handler.js';
import { ListarProblemasHandler } from './application/queries/handlers/listar-problemas.handler.js';
import { ObterGraficoProblemaHandler } from './application/queries/handlers/obter-grafico-problema.handler.js';
import { ObterRankingProblemaHandler } from './application/queries/handlers/obter-ranking-problema.handler.js';
import { ObterRankingTurmaHandler } from './application/queries/handlers/obter-ranking-turma.handler.js';
import { TentativaSubmetidaEventHandler } from './application/events/handlers/tentativa-submetida.event-handler.js';
import { ProblemasController } from './presentation/problemas.controller.js';
import { RankingsController } from './presentation/rankings.controller.js';
import { RestricoesController } from './presentation/restricoes.controller.js';
import { TentativasController } from './presentation/tentativas.controller.js';

@Module({
  imports: [CqrsModule],
  controllers: [ProblemasController, RankingsController, RestricoesController, TentativasController],
  providers: [
    {
      provide: IPROBLEMA_REPOSITORY,
      useClass: ProblemaRepository,
    },
    {
      provide: ITENTATIVA_REPOSITORY,
      useClass: TentativaRepository,
    },
    {
      provide: IRANKING_READ_REPOSITORY,
      useClass: RankingReadRepository,
    },
    ProblemaRepository,
    TentativaRepository,
    RankingReadRepository,
    AvaliadorOtimizacaoService,
    SubmeterTentativaHandler,
    CriarProblemaHandler,
    ListarProblemasHandler,
    ObterGraficoProblemaHandler,
    ObterRankingProblemaHandler,
    ObterRankingTurmaHandler,
    TentativaSubmetidaEventHandler,
  ],
  exports: [IPROBLEMA_REPOSITORY, ITENTATIVA_REPOSITORY, IRANKING_READ_REPOSITORY],
})
export class DesafiosOtimizacaoModule {}
