import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { TransacoesServico } from './transacoes.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { FiltroTransacoesDto } from './dto/filtro-transacoes.dto';

@ApiTags('Transações')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('transacoes')
export class TransacoesControlador {
  constructor(private readonly transacoes: TransacoesServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista transações por data e tipo' })
  @ApiResponse({ status: 200, description: 'Transações encontradas' })
  listar(
    @Query() filtro: FiltroTransacoesDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.transacoes.listar(filtro, requisicao.user);
  }
}
