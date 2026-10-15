import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Tokens de Interfaces
import { IPROBLEMA_REPOSITORY } from './domain/repositories/problema.repository.interface';
import { ITENTATIVA_REPOSITORY } from './domain/repositories/tentativa.repository.interface';
import { IRANKING_READ_REPOSITORY } from './domain/repositories/ranking-read.repository.interface';

// Implementações Prisma
import { ProblemaPrismaRepository } from './infrastructure/repositories/problema.repository.js';
import { TentativaPrismaRepository } from './infrastructure/repositories/tentativa.repository.js';
import { RankingReadPrismaRepository } from './infrastructure/repositories/ranking-read.repository.js';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: IPROBLEMA_REPOSITORY,
      useClass: ProblemaPrismaRepository,
    },
    {
      provide: ITENTATIVA_REPOSITORY,
      useClass: TentativaPrismaRepository,
    },
    {
      provide: IRANKING_READ_REPOSITORY,
      useClass: RankingReadPrismaRepository,
    },
    // Handlers, Services...
  ],
  exports: [IPROBLEMA_REPOSITORY, ITENTATIVA_REPOSITORY, IRANKING_READ_REPOSITORY],
})
export class DesafiosOtimizacaoModule {}
