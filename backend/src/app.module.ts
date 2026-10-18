import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissoesModule } from './permissoes/permissoes.module';
import { PerfisModule } from './perfis/perfis.module';
import { TurmasModule } from './turmas/turmas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { EstacoesAnimaisModule } from './estacoes-animais/estacoes-animais.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CulturasModule } from './culturas/culturas.module';
import { FazendasModule } from './fazendas/fazendas.module';
import { TalhoesModule } from './talhoes/talhoes.module';
import { PlantiosModule } from './plantios/plantios.module';
import { ColheitasModule } from './colheitas/colheitas.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PermissoesModule,
    PerfisModule,
    TurmasModule,
    UsuariosModule,
    AuthModule,
    EstacoesAnimaisModule,
    ScheduleModule.forRoot(),
    CulturasModule,
    FazendasModule,
    TalhoesModule,
    PlantiosModule,
    ColheitasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}