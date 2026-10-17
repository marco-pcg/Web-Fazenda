import { Module } from '@nestjs/common';
import { EspeciesRepository } from './especies/especies.repository';
import { EstacoesRepository } from './estacoes/estacoes.repository';
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
