import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurmasModule } from './turmas/turmas.module';
import { PerfisModule } from './perfis/perfis.module';
import { PermissoesModule } from './permissoes/permissoes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsuariosModule, TurmasModule, PerfisModule, PermissoesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
