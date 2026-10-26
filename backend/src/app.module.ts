import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurmasModule } from './turmas/turmas.module';
import { PerfisModule } from './perfis/perfis.module';
import { PermissoesModule } from './permissoes/permissoes.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CulturasModule } from './culturas/culturas.module';
import { FazendasModule } from './fazendas/fazendas.module';
import { TalhoesModule } from './talhoes/talhoes.module';
import { PlantiosModule } from './plantios/plantios.module';
import { ColheitasModule } from './colheitas/colheitas.module';
import { DesafiosOtimizacaoModule } from './desafios-otimizacao/desafios-otimizacao.module';
import { EstacoesAnimaisModule } from './estacoes-animais/estacoes-animais.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    PermissoesModule,
    PerfisModule,
    TurmasModule,
    UsuariosModule,
    AuthModule,
    CulturasModule,
    FazendasModule,
    TalhoesModule,
    PlantiosModule,
    ColheitasModule,
    DesafiosOtimizacaoModule,
    EstacoesAnimaisModule,
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
export class AppModule { }
