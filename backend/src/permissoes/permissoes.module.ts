import { Module } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { PermissoesController } from './permissoes.controller';
import { PermissoesRepository } from './permissoes.repository';

@Module({
  controllers: [PermissoesController],
  providers: [PermissoesService, PermissoesRepository],
  exports: [PermissoesService, PermissoesRepository],
})
export class PermissoesModule {}
