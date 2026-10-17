import { Module } from '@nestjs/common';
import { ColheitasController } from './colheitas.controller';
import { ColheitasService } from './colheitas.service';
import { ColheitasRepository } from './colheitas.repository';

@Module({
  controllers: [ColheitasController],
  providers: [ColheitasService, ColheitasRepository],
})
export class ColheitasModule {}
