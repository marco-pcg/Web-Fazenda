import { Module } from '@nestjs/common';
import { FazendasController } from './fazendas.controller';
import { FazendasService } from './fazendas.service';
import { FazendasRepository } from './fazendas.repository';

@Module({
  controllers: [FazendasController],
  providers: [FazendasService, FazendasRepository],
})
export class FazendasModule {}
