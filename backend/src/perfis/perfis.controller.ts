import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PerfisService } from './perfis.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { FilterPerfilDto } from './dto/filter-perfil.dto';
import { VincularPermissoesDto } from './dto/vincular-permissoes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Perfis')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  @Post()
  @RequirePermissions('perfis:criar')
  @ApiOperation({ summary: 'Cria um novo perfil de acesso' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Perfil já existente' })
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.perfisService.create(createPerfilDto);
  }

  @Get()
  @RequirePermissions('perfis:listar')
  @ApiOperation({ summary: 'Lista os perfis com filtros por nome e status ativo' })
  @ApiResponse({ status: 200, description: 'Lista paginada de perfis' })
  findAll(@Query() filtros: FilterPerfilDto) {
    return this.perfisService.findAll(filtros);
  }

  @Get(':id')
  @RequirePermissions('perfis:visualizar')
  @ApiOperation({ summary: 'Busca perfil por ID com suas permissões associadas' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  findById(@Param('id') id: string) {
    return this.perfisService.findById(id);
  }

  @Patch(':id/permissoes')
  @RequirePermissions('perfis:editar')
  @ApiOperation({ summary: 'Vincula permissões a um perfil' })
  @ApiResponse({ status: 200, description: 'Permissões atualizadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  vincularPermissoes(@Param('id') id: string, @Body() vincularPermissoesDto: VincularPermissoesDto) {
    return this.perfisService.vincularPermissoes(id, vincularPermissoesDto.permissoes_ids);
  }

  @Patch(':id')
  @RequirePermissions('perfis:editar')
  @ApiOperation({ summary: 'Atualiza dados de um perfil' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  update(@Param('id') id: string, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfisService.update(id, updatePerfilDto);
  }

  @Delete(':id')
  @RequirePermissions('perfis:deletar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um perfil' })
  @ApiResponse({ status: 204, description: 'Perfil removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  remove(@Param('id') id: string) {
    return this.perfisService.remove(id);
  }
}
