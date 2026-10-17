import { Module } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { PerfisController } from './perfis.controller';
import { PerfisRepository } from './perfis.repository';

@Module({
  controllers: [PerfisController],
  providers: [PerfisService, PerfisRepository],
  exports: [PerfisService, PerfisRepository],
})
export class PerfisModule {}
