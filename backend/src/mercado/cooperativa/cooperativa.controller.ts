import {
  Body,
  Controller,
  Delete,
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
import { CooperativaService } from './cooperativa.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { AlterarContribuicaoDto } from './dto/alterar-contribuicao.dto';
import { ContribuirDto } from './dto/contribuir.dto';
import { FiltroVendasConjuntasDto } from './dto/filtro-vendas-conjuntas.dto';
import { CriarVendaDto } from '../ordens/dto/criar-venda.dto';
import { FiltroTransacoesDto } from '../transacoes/dto/filtro-transacoes.dto';

@ApiTags('Cooperativa')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cooperativa')
export class CooperativaController {
  constructor(private readonly cooperativa: CooperativaService) {}

  @Get('vendas-conjuntas')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista vendas conjuntas disponíveis e concluídas' })
  @ApiResponse({ status: 200, description: 'Vendas conjuntas encontradas' })
  listar(
    @Query() filtro: FiltroVendasConjuntasDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.listar(filtro, req.user);
  }

  @Post('vendas-conjuntas')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Cria venda conjunta com a primeira contribuição' })
  @ApiResponse({ status: 201, description: 'Venda conjunta criada' })
  criar(
    @Body() dto: CriarVendaDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.criar(dto, req.user);
  }

  @Get('vendas-conjuntas/:id')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Consulta venda conjunta e contribuições pelo ID' })
  @ApiResponse({ status: 200, description: 'Venda conjunta encontrada' })
  detalhe(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.detalhe(id, req.user);
  }

  @Post('vendas-conjuntas/:id/contribuicoes')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Adiciona contribuição de uma fazenda' })
  @ApiResponse({ status: 201, description: 'Contribuição criada' })
  contribuir(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ContribuirDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.contribuir(id, dto, req.user);
  }

  @Patch('vendas-conjuntas/:id/contribuicoes/:ordemId')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Altera a quantidade da própria contribuição' })
  @ApiResponse({ status: 200, description: 'Contribuição atualizada' })
  alterar(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ordemId', ParseUUIDPipe) ordemId: string,
    @Body() dto: AlterarContribuicaoDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.alterar(id, ordemId, dto, req.user);
  }

  @Delete('vendas-conjuntas/:id/contribuicoes/:ordemId')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Retira a própria contribuição e libera estoque' })
  @ApiResponse({ status: 200, description: 'Contribuição retirada' })
  retirar(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ordemId', ParseUUIDPipe) ordemId: string,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.retirar(id, ordemId, req.user);
  }

  @Post('vendas-conjuntas/:id/distribuir')
  @RequirePermissions('cooperativa:distribuir')
  @ApiOperation({ summary: 'Retém taxa de 5% e distribui o valor líquido' })
  @ApiResponse({ status: 201, description: 'Distribuição concluída' })
  distribuir(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.distribuir(id, req.user);
  }

  @Get('extrato')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({
    summary: 'Consulta o extrato da cooperativa por data e tipo',
  })
  @ApiResponse({ status: 200, description: 'Extrato encontrado' })
  extrato(
    @Query() filtro: FiltroTransacoesDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.cooperativa.extrato(filtro, req.user);
  }
}
