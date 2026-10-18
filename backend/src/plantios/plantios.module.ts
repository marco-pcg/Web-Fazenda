import { Module } from '@nestjs/common';
import { PlantiosController } from './plantios.controller';
import { PlantiosService } from './plantios.service';
import { PlantiosRepository } from './plantios.repository';
import { PlantiosScheduler } from './plantios.scheduler';
import { TalhoesRepository } from '../talhoes/talhoes.repository';
import { FazendasRepository } from '../fazendas/fazendas.repository';
import { CulturasRepository } from '../culturas/culturas.repository';
import { ColheitasRepository } from '../colheitas/colheitas.repository';
import { MercadoModule } from '../mercado/mercado.module';

@Module({
  imports: [MercadoModule],
  controllers: [PlantiosController],
  providers: [
    PlantiosService,
    PlantiosRepository,
    PlantiosScheduler,
    TalhoesRepository,
    FazendasRepository,
    CulturasRepository,
    ColheitasRepository,
  ],
})
export class PlantiosModule {}
