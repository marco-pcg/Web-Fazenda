import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post()
  @RequirePermissions('CRIAR_USUARIO')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @RequirePermissions('LISTAR_USUARIOS')
  findAll(@Query() filter: FilterUsuarioDto) {
    return this.usuariosService.findAll(filter);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_USUARIO')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('EDITAR_USUARIO')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @RequirePermissions('DELETAR_USUARIO')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
