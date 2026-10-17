import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { FilterPermissaoDto } from './dto/filter-permissao.dto';

@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) { }

  @Post()
  create(@Body() createPermissaoDto: CreatePermissaoDto) {
    return this.permissoesService.create(createPermissaoDto);
  }

  @Get()
  findAll(@Query() filtros: FilterPermissaoDto) {
    return this.permissoesService.findAll(filtros);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.permissoesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissaoDto: UpdatePermissaoDto) {
    return this.permissoesService.update(id, updatePermissaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissoesService.remove(id);
  }
}
