import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { CreatePermissoeDto } from './dto/create-permissoe.dto';
import { UpdatePermissoeDto } from './dto/update-permissoe.dto';

@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Post()
  create(@Body() createPermissoeDto: CreatePermissoeDto) {
    return this.permissoesService.create(createPermissoeDto);
  }

  @Get()
  findAll() {
    return this.permissoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissoeDto: UpdatePermissoeDto) {
    return this.permissoesService.update(+id, updatePermissoeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissoesService.remove(+id);
  }
}
