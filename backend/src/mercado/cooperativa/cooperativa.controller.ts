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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CooperativaServico } from './cooperativa.service';
import { CriarVendaDto } from '../ordens/dto/criar-venda.dto';
import { ContribuirDto } from './dto/contribuir.dto';
import { AlterarContribuicaoDto } from './dto/alterar-contribuicao.dto';
import { FiltroVendaConjuntaDto } from './dto/filtro-venda-conjunta.dto';
import type { UsuarioLogado } from '../shared/mercado.types';

@ApiTags('Cooperativa')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cooperativa/vendas-conjuntas')
export class CooperativaControlador {
  constructor(private readonly cooperativaServico: CooperativaServico) {}

  @Get()
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Lista as vendas conjuntas' })
  findAll(
    @Query() filtro: FiltroVendaConjuntaDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.findAll(filtro, usuario);
  }

  @Post()
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({
    summary: 'Cria uma venda conjunta com a primeira contribuição',
  })
  create(@Body() dados: CriarVendaDto, @CurrentUser() usuario: UsuarioLogado) {
    return this.cooperativaServico.create(dados, usuario);
  }

  @Get(':id')
  @RequirePermissions('mercado:consultar')
  @ApiOperation({ summary: 'Mostra uma venda conjunta e suas contribuições' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.findOne(id, usuario);
  }

  @Post(':id/contribuicoes')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Contribui com a produção de uma fazenda' })
  contribuir(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: ContribuirDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.contribuir(id, dados, usuario);
  }

  @Patch(':id/contribuicoes/:ordemId')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({ summary: 'Altera a quantidade da própria contribuição' })
  alterar(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ordemId', ParseUUIDPipe) ordemId: string,
    @Body() dados: AlterarContribuicaoDto,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.alterar(id, ordemId, dados, usuario);
  }

  @Delete(':id/contribuicoes/:ordemId')
  @RequirePermissions('cooperativa:participar')
  @ApiOperation({
    summary: 'Retira a própria contribuição e devolve o estoque',
  })
  retirar(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ordemId', ParseUUIDPipe) ordemId: string,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.retirar(id, ordemId, usuario);
  }

  @Post(':id/distribuir')
  @RequirePermissions('cooperativa:distribuir')
  @ApiOperation({ summary: 'Retém a taxa de 5% e reparte o valor líquido' })
  distribuir(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: UsuarioLogado,
  ) {
    return this.cooperativaServico.distribuir(id, usuario);
  }
}
