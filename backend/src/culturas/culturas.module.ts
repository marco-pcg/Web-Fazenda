import { Module } from '@nestjs/common';
import { CulturasController } from './culturas.controller';
import { CulturasService } from './culturas.service';
import { CulturasRepository } from './culturas.repository';

@Module({
  controllers: [CulturasController],
  providers: [CulturasService, CulturasRepository],
})
export class CulturasModule {}
