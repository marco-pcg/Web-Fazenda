import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EstacaoResponse, EstacoesPaginadasResponse } from '../swagger.schemas';
import { EstacoesService } from './estacoes.service';
import { CreateEstacaoDto } from './dto/create-estacao.dto';
import { QueryEstacaoDto } from './dto/query-estacao.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Estações')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estacoes')
export class EstacoesController {
  constructor(private readonly estacoesService: EstacoesService) {}

  @Get()
  @RequirePermissions('estacoes:listar')
  @ApiOperation({ summary: 'Lista as estações com filtros por nome e ordem' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de estações',
    type: EstacoesPaginadasResponse,
  })
  @ApiResponse({ status: 400, description: 'Filtros inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(@Query() filtros: QueryEstacaoDto) {
    return this.estacoesService.listar(filtros);
  }

  @Post()
  @RequirePermissions('estacoes:criar')
  @ApiOperation({ summary: 'Cadastra uma nova estação (somente admin)' })
  @ApiResponse({
    status: 201,
    description: 'Estação cadastrada com sucesso',
    type: EstacaoResponse,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para cadastrar' })
  @ApiResponse({ status: 409, description: 'Nome ou ordem já cadastrados' })
  criar(@Body() createEstacaoDto: CreateEstacaoDto) {
    return this.estacoesService.criar(createEstacaoDto);
  }
}
