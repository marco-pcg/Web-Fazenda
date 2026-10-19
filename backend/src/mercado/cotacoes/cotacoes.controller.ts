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
import { CotacoesServico } from './cotacoes.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { CotacaoAtualDto } from './dto/cotacao-atual.dto';
import { FiltroCotacoesDto } from './dto/filtro-cotacoes.dto';

@ApiTags('Cotações')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cotacoes')
export class CotacoesControlador {
  constructor(private readonly cotacoes: CotacoesServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista cotações por produto, turma e temporada' })
  @ApiResponse({ status: 200, description: 'Cotações encontradas' })
  listar(
    @Query() filtro: FiltroCotacoesDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.cotacoes.listar(filtro, requisicao.user);
  }

  @Get('atual')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Obtém a cotação da temporada atual da fazenda' })
  @ApiResponse({ status: 200, description: 'Cotação atual' })
  atual(
    @Query() consulta: CotacaoAtualDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.cotacoes.atual(consulta, requisicao.user);
  }
}
