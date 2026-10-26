import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { hoje } from '../common/datas';
import { PlantiosRepository } from './plantios.repository';

@Injectable()
export class PlantiosScheduler {
  private readonly logger = new Logger(PlantiosScheduler.name);

  constructor(private readonly plantiosRepository: PlantiosRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async verificarPlantiosProntos() {
    const quantidade = await this.plantiosRepository.marcarProntos(hoje());

    if (quantidade > 0) {
      this.logger.debug('Plantios prontos para colher: ' + quantidade);
    }
  }
}
