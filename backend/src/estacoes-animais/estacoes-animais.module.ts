import { Module } from '@nestjs/common';
import { EspeciesController } from './especies/especies.controller';
import { EspeciesRepository } from './especies/especies.repository';
import { EspeciesService } from './especies/especies.service';
import { EstacoesController } from './estacoes/estacoes.controller';
import { EstacoesRepository } from './estacoes/estacoes.repository';
import { EstacoesService } from './estacoes/estacoes.service';
import { EventosClimaticosRepository } from './eventos-climaticos/eventos-climaticos.repository';
import { ESTOQUE_PORT } from './ports/estoque.port';
import { FAZENDAS_PORT } from './ports/fazendas.port';
import { TURMAS_PORT } from './ports/turmas.port';
import { EstoquePortProvisorio } from './ports/provisorios/estoque.port.provisorio';
import { FazendasPortProvisorio } from './ports/provisorios/fazendas.port.provisorio';
import { TurmasPortProvisorio } from './ports/provisorios/turmas.port.provisorio';
import { ProducoesRepository } from './producoes/producoes.repository';
import { AlimentacoesRepository } from './rebanhos/alimentacoes.repository';
import { RebanhosRepository } from './rebanhos/rebanhos.repository';
import { TemporadasRepository } from './temporadas/temporadas.repository';

@Module({
  controllers: [EstacoesController, EspeciesController],
  providers: [
    EstacoesService,
    EspeciesService,

    EstacoesRepository,
    TemporadasRepository,
    EventosClimaticosRepository,
    EspeciesRepository,
    RebanhosRepository,
    AlimentacoesRepository,
    ProducoesRepository,

    { provide: TURMAS_PORT, useClass: TurmasPortProvisorio },
    { provide: FAZENDAS_PORT, useClass: FazendasPortProvisorio },
    { provide: ESTOQUE_PORT, useClass: EstoquePortProvisorio },
  ],
})
export class EstacoesAnimaisModule {}
