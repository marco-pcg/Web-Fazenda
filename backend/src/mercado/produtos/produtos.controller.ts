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
import { ProdutosServico } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutoDto } from './dto/filtro-produto.dto';

@ApiTags('Produtos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('produtos')
export class ProdutosControlador {
  constructor(private readonly produtosServico: ProdutosServico) {}

  @Post()
  @RequirePermissions('produtos:gerenciar')
  @ApiOperation({ summary: 'Cadastra um produto do mercado' })
  create(@Body() dados: CreateProdutoDto) {
    return this.produtosServico.create(dados);
  }

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista os produtos' })
  findAll(@Query() filtro: FiltroProdutoDto) {
    return this.produtosServico.findAll(filtro);
  }

  @Patch(':id')
  @RequirePermissions('produtos:gerenciar')
  @ApiOperation({ summary: 'Atualiza um produto e recalcula as cotações' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: UpdateProdutoDto,
  ) {
    return this.produtosServico.update(id, dados);
  }
}
