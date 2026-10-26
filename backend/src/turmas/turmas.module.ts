import { Module } from '@nestjs/common';
import { TurmasService } from './turmas.service';
import { TurmasController } from './turmas.controller';
import { TurmasRepository } from './turmas.repository';

@Module({
  controllers: [TurmasController],
  providers: [TurmasService, TurmasRepository],
})
export class TurmasModule {}
