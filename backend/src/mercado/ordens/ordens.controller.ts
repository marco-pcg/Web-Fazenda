import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { OrdensServico } from './ordens.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { ComprarDto } from './dto/comprar.dto';
import { CriarVendaDto } from './dto/criar-venda.dto';
import { FiltroOrdensDto } from './dto/filtro-ordens.dto';

@ApiTags('Ordens')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ordens')
export class OrdensControlador {
  constructor(private readonly ordens: OrdensServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({
    summary: 'Lista ordens por tipo, status, produto e modalidade',
  })
  @ApiResponse({ status: 200, description: 'Ordens encontradas' })
  listar(
    @Query() filtro: FiltroOrdensDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.ordens.listar(filtro, requisicao.user);
  }

  @Post('venda')
  @RequirePermissions('mercado:vender')
  @ApiOperation({ summary: 'Cria oferta avulsa e reserva estoque' })
  @ApiResponse({ status: 201, description: 'Oferta criada' })
  vender(
    @Body() dto: CriarVendaDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.ordens.vender(dto, requisicao.user);
  }

  @Post('compra')
  @RequirePermissions('mercado:comprar')
  @ApiOperation({
    summary: 'Compra uma oferta avulsa ou uma venda conjunta inteira',
  })
  @ApiResponse({ status: 201, description: 'Compra concluída' })
  comprar(
    @Body() dto: ComprarDto,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.ordens.comprar(dto, requisicao.user);
  }

  @Get(':id')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Consulta ordem pelo ID' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada' })
  detalhe(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.ordens.detalhe(id, requisicao.user);
  }

  @Patch(':id/cancelar')
  @RequirePermissions('mercado:vender')
  @ApiOperation({ summary: 'Cancela oferta avulsa e libera estoque' })
  @ApiResponse({ status: 200, description: 'Oferta cancelada' })
  cancelar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() requisicao: Request & { user: UsuarioMercado },
  ) {
    return this.ordens.cancelar(id, requisicao.user);
  }
}
