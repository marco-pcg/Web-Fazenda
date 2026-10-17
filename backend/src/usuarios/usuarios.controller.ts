import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Usuários')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @RequirePermissions('usuarios:criar')
  @ApiOperation({ summary: 'Cadastra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @RequirePermissions('usuarios:listar')
  @ApiOperation({ summary: 'Lista usuários com paginação e filtros de nome e perfil' })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuários' })
  findAll(@Query() filtros: FilterUsuarioDto) {
    return this.usuariosService.findAll(filtros);
  }

  @Get(':id')
  @RequirePermissions('usuarios:visualizar')
  @ApiOperation({ summary: 'Busca usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findById(@Param('id') id: string) {
    return this.usuariosService.findById(id);
  }

  @Get('email/:email')
  @RequirePermissions('usuarios:visualizar')
  @ApiOperation({ summary: 'Busca usuário por e-mail' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByEmail(@Param('email') email: string) {
    return this.usuariosService.findByEmail(email);
  }

  @Patch(':id')
  @RequirePermissions('usuarios:editar')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @RequirePermissions('usuarios:deletar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um usuário por ID' })
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}