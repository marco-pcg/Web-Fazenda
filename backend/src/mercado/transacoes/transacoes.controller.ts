import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TransacoesRepositorio } from './transacoes.repository';
import { FiltroTransacaoDto } from './dto/filtro-transacao.dto';
import type { UsuarioLogado } from '../shared/mercado.types';

@ApiTags('Transações')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('transacoes')
export class TransacoesControlador {
  constructor(private readonly transacoesRepositorio: TransacoesRepositorio) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista as transações por data e tipo' })
  findAll(
    @Query() filtro: FiltroTransacaoDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.transacoesRepositorio.findAll(filtro, usuario);
  }
}
