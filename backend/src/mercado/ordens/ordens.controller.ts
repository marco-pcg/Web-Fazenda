import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrdensServico } from './ordens.service';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { ComprarDto } from './dto/comprar.dto';
import { FiltroOrdemDto } from './dto/filtro-ordem.dto';
import type { UsuarioLogado } from '../shared/mercado.types';

@ApiTags('Ordens')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ordens')
export class OrdensControlador {
  constructor(private readonly ordensServico: OrdensServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista as ordens de compra e venda' })
  findAll(
    @Query() filtro: FiltroOrdemDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.ordensServico.findAll(filtro, usuario);
  }

  @Post('venda')
  @RequirePermissions('mercado:vender')
  @ApiOperation({ summary: 'Cria uma oferta avulsa e reserva o estoque' })
  vender(@Body() dados: CriarVendaDto, @CurrentUser() usuario: UsuarioLogado) {
    return this.ordensServico.vender(dados, usuario);
  }

  @Post('compra')
  @RequirePermissions('mercado:comprar')
  @ApiOperation({ summary: 'Compra uma oferta avulsa ou uma venda conjunta' })
  comprar(@Body() dados: ComprarDto, @CurrentUser() usuario: UsuarioLogado) {
    return this.ordensServico.comprar(dados, usuario);
  }

  @Get(':id')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Mostra uma ordem' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.ordensServico.findOne(id, usuario);
  }

  @Patch(':id/cancelar')
  @RequirePermissions('mercado:vender')
  @ApiOperation({ summary: 'Cancela uma oferta avulsa e devolve o estoque' })
  cancelar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.ordensServico.cancelar(id, usuario);
  }
}
