// src/app.module.ts
import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissoesModule } from './permissoes/permissoes.module';
import { PerfisModule } from './perfis/perfis.module';
import { TurmasModule } from './turmas/turmas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PermissoesModule,
    PerfisModule,
    TurmasModule,
    UsuariosModule,
    AuthModule,
  ],
=======
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { EstacoesAnimaisModule } from './modules/estacoes-animais/estacoes-animais.module.js';

@Module({
  imports: [DatabaseModule, EstacoesAnimaisModule],
>>>>>>> 58ebeaf (feat(estacoes-animais): cria EstacoesAnimaisModule e registra no AppModule)
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
