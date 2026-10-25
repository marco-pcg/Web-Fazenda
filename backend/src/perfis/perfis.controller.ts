import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { UpdatePerfiDto } from './dto/update-perfi.dto';
import { VincularPermissoesDto } from './dto/vincular-permissoes.dto';
import { PaginacaoDto } from 'src/common/dtos/paginacao.dto';

@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) { }

  @Post()
  create(@Body() createPerfiDto: CreatePerfiDto) {
    return this.perfisService.create(createPerfiDto);
  }

  @Get()
  findAll(@Query() filter: PaginacaoDto) {
    return this.perfisService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfisService.findOne(id);
  }

  @Patch(':id/permissoes')
  vincularPermissoes(@Param('id') id: string, @Body() vincularPermissoesDto: VincularPermissoesDto) {
    return this.perfisService.vincularPermissoes(id, vincularPermissoesDto.permissoes);
  }
}
