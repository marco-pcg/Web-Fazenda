import { Module } from '@nestjs/common';
import { EspeciesController } from './especies/especies.controller';
import { EspeciesRepository } from './especies/especies.repository';
import { EspeciesService } from './especies/especies.service';
import { EstacoesController } from './estacoes/estacoes.controller';
import { EstacoesRepository } from './estacoes/estacoes.repository';
import { EstacoesService } from './estacoes/estacoes.service';
import { EventosClimaticosController } from './eventos-climaticos/eventos-climaticos.controller';
import { EventosClimaticosRepository } from './eventos-climaticos/eventos-climaticos.repository';
import { EventosClimaticosService } from './eventos-climaticos/eventos-climaticos.service';
import { ESTOQUE_PORT } from './ports/estoque.port';
import { FAZENDAS_PORT } from './ports/fazendas.port';
import { TURMAS_PORT } from './ports/turmas.port';
import { TurmasAdapter } from './ports/turmas.adapter';
import { EstoquePortProvisorio } from './ports/provisorios/estoque.port.provisorio';
import { FazendasPortProvisorio } from './ports/provisorios/fazendas.port.provisorio';
import { ProducoesController } from './producoes/producoes.controller';
import { ProducoesRepository } from './producoes/producoes.repository';
import { ProducoesService } from './producoes/producoes.service';
import { TemporadaAvancoProducer } from './queue/temporada-avanco.producer';
import { AlimentacoesRepository } from './rebanhos/alimentacoes.repository';
import { AlimentacoesService } from './rebanhos/alimentacoes.service';
import { RebanhosController } from './rebanhos/rebanhos.controller';
import { RebanhosRepository } from './rebanhos/rebanhos.repository';
import { RebanhosService } from './rebanhos/rebanhos.service';
import { TemporadasController } from './temporadas/temporadas.controller';
import { TemporadasRepository } from './temporadas/temporadas.repository';
import { TemporadasService } from './temporadas/temporadas.service';

@Module({
  controllers: [
    EstacoesController,
    EspeciesController,
    TemporadasController,
    EventosClimaticosController,
    RebanhosController,
    ProducoesController,
  ],
  providers: [
    EstacoesService,
    EspeciesService,
    TemporadasService,
    EventosClimaticosService,
    RebanhosService,
    AlimentacoesService,
    ProducoesService,
    TemporadaAvancoProducer,

    EstacoesRepository,
    TemporadasRepository,
    EventosClimaticosRepository,
    EspeciesRepository,
    RebanhosRepository,
    AlimentacoesRepository,
    ProducoesRepository,

    { provide: TURMAS_PORT, useClass: TurmasAdapter },
    { provide: FAZENDAS_PORT, useClass: FazendasPortProvisorio },
    { provide: ESTOQUE_PORT, useClass: EstoquePortProvisorio },
  ],
})
export class EstacoesAnimaisModule {}
