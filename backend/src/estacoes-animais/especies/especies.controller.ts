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
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EspecieResponse, EspeciesPaginadasResponse } from '../swagger.schemas';
import { EspeciesService } from './especies.service';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';
import { QueryEspecieDto } from './dto/query-especie.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Espécies')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('especies')
export class EspeciesController {
  constructor(private readonly especiesService: EspeciesService) {}

  @Get()
  @RequirePermissions('especies:listar')
  @ApiOperation({ summary: 'Lista as espécies com filtros por nome e produto' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de espécies',
    type: EspeciesPaginadasResponse,
  })
  @ApiResponse({ status: 400, description: 'Filtros inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(@Query() filtros: QueryEspecieDto) {
    return this.especiesService.listar(filtros);
  }

  @Post()
  @RequirePermissions('especies:criar')
  @ApiOperation({ summary: 'Cadastra uma nova espécie (admin e professor)' })
  @ApiResponse({
    status: 201,
    description: 'Espécie cadastrada com sucesso',
    type: EspecieResponse,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para cadastrar' })
  @ApiResponse({ status: 409, description: 'Nome de espécie já cadastrado' })
  criar(@Body() createEspecieDto: CreateEspecieDto) {
    return this.especiesService.criar(createEspecieDto);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID da espécie',
  })
  @RequirePermissions('especies:editar')
  @ApiOperation({
    summary: 'Atualiza dados de uma espécie (admin e professor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Espécie atualizada com sucesso',
    type: EspecieResponse,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  @ApiResponse({ status: 404, description: 'Espécie não encontrada' })
  @ApiResponse({ status: 409, description: 'Nome já usado por outra espécie' })
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEspecieDto: UpdateEspecieDto,
  ) {
    return this.especiesService.atualizar(id, updateEspecieDto);
  }
}
