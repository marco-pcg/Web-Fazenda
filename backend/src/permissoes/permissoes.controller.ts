import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { PermissoesService } from './permissoes.service';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { FilterPermissaoDto } from './dto/filter-permissao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Permissões')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Post()
  @RequirePermissions('permissoes:criar')
  @ApiOperation({ summary: 'Cria uma permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Permissão já existente' })
  create(@Body() createPermissaoDto: CreatePermissaoDto) {
    return this.permissoesService.create(createPermissaoDto);
  }

  @Get()
  @RequirePermissions('permissoes:listar')
  @ApiOperation({ summary: 'Lista permissões com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de permissões' })
  findAll(@Query() filtros: FilterPermissaoDto) {
    return this.permissoesService.findAll(filtros);
  }

  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da permissão' })
  @RequirePermissions('permissoes:visualizar')
  @ApiOperation({ summary: 'Busca uma permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  findById(@Param('id') id: string) {
    return this.permissoesService.findById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da permissão' })
  @RequirePermissions('permissoes:editar')
  @ApiOperation({ summary: 'Atualiza uma permissão' })
  @ApiResponse({ status: 200, description: 'Permissão atualizada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updatePermissaoDto: UpdatePermissaoDto,
  ) {
    return this.permissoesService.update(id, updatePermissaoDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da permissão' })
  @RequirePermissions('permissoes:deletar')
  @ApiOperation({ summary: 'Remove uma permissão' })
  @ApiResponse({ status: 204, description: 'Permissão removida' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissoesService.remove(id);
  }
}
