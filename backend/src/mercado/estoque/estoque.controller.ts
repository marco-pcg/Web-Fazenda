import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { EstoqueServico } from './estoque.service';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';
import type { UsuarioLogado } from '../shared/mercado.types';

@ApiTags('Estoque')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estoque')
export class EstoqueControlador {
  constructor(private readonly estoqueServico: EstoqueServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista o estoque das fazendas' })
  findAll(
    @Query() filtro: FiltroEstoqueDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.estoqueServico.findAll(filtro, usuario);
  }
}
