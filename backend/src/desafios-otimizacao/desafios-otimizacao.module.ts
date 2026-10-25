import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { IPROBLEMA_REPOSITORY } from './infrastructure/repositories/problema.repository.interface'
import { ITENTATIVA_REPOSITORY } from './infrastructure/repositories/tentativa.repository.interface'
import { IRANKING_READ_REPOSITORY } from './infrastructure/repositories/ranking-read.repository.interface'

import { ProblemaPrismaRepository } from './infrastructure/repositories/problema.repository'
import { TentativaPrismaRepository } from './infrastructure/repositories/tentativa.repository'
import { RankingReadPrismaRepository } from './infrastructure/repositories/ranking-read.repository'

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
  ],
  exports: [IPROBLEMA_REPOSITORY, ITENTATIVA_REPOSITORY, IRANKING_READ_REPOSITORY],
})
export class DesafiosOtimizacaoModule {}
