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
import { EstoqueServico } from './estoque.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';

@ApiTags('Estoque')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estoque')
export class EstoqueControlador {
  constructor(private readonly estoque: EstoqueServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista estoque disponível por produto e fazenda' })
  @ApiResponse({ status: 200, description: 'Estoque encontrado' })
  listar(
    @Query() filtro: FiltroEstoqueDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.estoque.listar(filtro, requisicao.user);
  }
}
