import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { UpdatePerfiDto } from './dto/update-perfi.dto';
import { VincularPermissoesDto } from './dto/vincular-permissoes.dto';

@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) { }

  @Post()
  create(@Body() createPerfiDto: CreatePerfiDto) {
    return this.perfisService.create(createPerfiDto);
  }

  @Get()
  findAll() {
    return this.perfisService.findAll();
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
