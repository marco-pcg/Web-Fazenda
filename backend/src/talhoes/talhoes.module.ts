import { Module } from '@nestjs/common';
import { TalhoesController } from './talhoes.controller';
import { TalhoesService } from './talhoes.service';
import { TalhoesRepository } from './talhoes.repository';
import { FazendasRepository } from '../fazendas/fazendas.repository';

@Module({
  controllers: [TalhoesController],
  providers: [TalhoesService, TalhoesRepository, FazendasRepository],
})
export class TalhoesModule {}
