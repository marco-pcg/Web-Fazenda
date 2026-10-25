import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { VincularPermissoesDto } from './dto/vincular-permissoes.dto';
import { PaginacaoDto } from 'src/common/dtos/paginacao.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) { }

  @Post()
  @RequirePermissions('CRIAR_PERFIL')
  create(@Body() createPerfiDto: CreatePerfiDto) {
    return this.perfisService.create(createPerfiDto);
  }

  @Get()
  @RequirePermissions('LISTAR_PERFIS')
  findAll(@Query() filter: PaginacaoDto) {
    return this.perfisService.findAll(filter);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_PERFIL')
  findOne(@Param('id') id: string) {
    return this.perfisService.findOne(id);
  }

  @Patch(':id/permissoes')
  @RequirePermissions('EDITAR_PERFIL')
  vincularPermissoes(@Param('id') id: string, @Body() vincularPermissoesDto: VincularPermissoesDto) {
    return this.perfisService.vincularPermissoes(id, vincularPermissoesDto.permissoes);
  }
}
