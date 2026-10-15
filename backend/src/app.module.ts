import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DesafiosOtimizacaoModule } from './desafios-otimizacao/desafios-otimizacao.module.js';

@Module({
  imports: [DesafiosOtimizacaoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
