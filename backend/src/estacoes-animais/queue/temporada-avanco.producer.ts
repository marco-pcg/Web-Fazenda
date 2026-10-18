import { Injectable } from '@nestjs/common';
import { database as knex } from '../../db/knex-connection';
import { TemporadasService } from '../temporadas/temporadas.service';
import { TemporadasRepository } from '../temporadas/temporadas.repository';
import { EventosClimaticosService } from '../eventos-climaticos/eventos-climaticos.service';
import { StatusTemporada } from '../../common/enums/enums';

@Injectable()
export class TemporadaAvancoProducer {
  constructor(
    private readonly temporadasService: TemporadasService,
    private readonly temporadasRepository: TemporadasRepository,
    private readonly eventosClimaticosService: EventosClimaticosService,
  ) {}

  async enfileirar(
    temporada_id: string,
    status_anterior: StatusTemporada,
  ): Promise<string> {
    try {
      await knex.transaction(async (trx) => {
        if (status_anterior === StatusTemporada.PLANEJADA) {
          await this.temporadasService.ativar(temporada_id, trx);
        } else {
          await this.eventosClimaticosService.encerrarAtivosDaTemporada(
            temporada_id,
            trx,
          );
          await this.temporadasService.encerrarEAtivarProxima(
            temporada_id,
            trx,
          );
        }
      });
    } catch (erro) {
      await this.temporadasRepository.update(temporada_id, {
        status: status_anterior,
      });
      throw erro;
    }

    return `provisorio-${temporada_id}`;
  }
}
