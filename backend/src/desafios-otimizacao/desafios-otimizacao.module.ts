import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GerarPlanoPlantioHandler } from './gerar-plano-plantio.command';
import { ObterPlanoPlantioHandler } from './obter-plano-plantio.query';
import { PlanosPlantioController } from './planos-plantio.controller';
import { PlanosPlantioRepository } from './planos-plantio.repository';

@Module({
  imports: [CqrsModule],
  controllers: [PlanosPlantioController],
  providers: [
    GerarPlanoPlantioHandler,
    ObterPlanoPlantioHandler,
    PlanosPlantioRepository,
  ],
})
export class DesafiosOtimizacaoModule {}
