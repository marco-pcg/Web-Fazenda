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
import { ProdutosService } from './produtos.service';
import type { UsuarioMercado } from '../shared/mercado.types';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { EditarProdutoDto } from './dto/editar-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';

@ApiTags('Produtos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtos: ProdutosService) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista produtos com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Produtos encontrados' })
  listar(@Query() filtro: FiltroProdutosDto) {
    return this.produtos.listar(filtro);
  }

  @Post()
  @RequirePermissions('produtos:gerenciar')
  @ApiOperation({ summary: 'Cadastra produto do mercado' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  criar(
    @Body() dto: CriarProdutoDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.produtos.criar(dto, req.user);
  }

  @Patch(':id')
  @RequirePermissions('produtos:gerenciar')
  @ApiOperation({ summary: 'Atualiza produto e recalcula as cotações' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  editar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditarProdutoDto,
    @Req() req: Request & { user: UsuarioMercado },
  ) {
    return this.produtos.editar(id, dto, req.user);
  }
}
