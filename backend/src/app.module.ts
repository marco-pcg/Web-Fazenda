import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { EstacoesAnimaisModule } from './modules/estacoes-animais/estacoes-animais.module.js';

@Module({
  imports: [DatabaseModule, EstacoesAnimaisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
