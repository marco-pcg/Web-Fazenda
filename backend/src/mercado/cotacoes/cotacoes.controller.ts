import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CotacoesServico } from './cotacoes.service';
import { FiltroCotacaoDto } from './dto/filtro-cotacao.dto';
import { CotacaoAtualDto } from './dto/cotacao-atual.dto';
import type { UsuarioLogado } from '../shared/mercado.types';

@ApiTags('Cotações')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cotacoes')
export class CotacoesControlador {
  constructor(private readonly cotacoesServico: CotacoesServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista as cotações por produto, turma e temporada' })
  findAll(
    @Query() filtro: FiltroCotacaoDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cotacoesServico.findAll(filtro, usuario);
  }

  @Get('atual')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Mostra a cotação da temporada atual da fazenda' })
  atual(
    @Query() consulta: CotacaoAtualDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cotacoesServico.atual(consulta, usuario);
  }
}
