import { Module } from '@nestjs/common';
import { EspeciesRepository } from './especies/especies.repository.js';
import { EstacoesRepository } from './estacoes/estacoes.repository.js';
import { EventosClimaticosRepository } from './eventos-climaticos/eventos-climaticos.repository.js';
import { ESTOQUE_PORT } from './ports/estoque.port.js';
import { FAZENDAS_PORT } from './ports/fazendas.port.js';
import { TURMAS_PORT } from './ports/turmas.port.js';
import { EstoquePortProvisorio } from './ports/provisorios/estoque.port.provisorio.js';
import { FazendasPortProvisorio } from './ports/provisorios/fazendas.port.provisorio.js';
import { TurmasPortProvisorio } from './ports/provisorios/turmas.port.provisorio.js';
import { ProducoesRepository } from './producoes/producoes.repository.js';
import { AlimentacoesRepository } from './rebanhos/alimentacoes.repository.js';
import { RebanhosRepository } from './rebanhos/rebanhos.repository.js';
import { TemporadasRepository } from './temporadas/temporadas.repository.js';

@Module({
  providers: [
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
