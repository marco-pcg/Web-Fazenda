import {
  Body,
  Controller,
  Delete,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CulturasService } from './culturas.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';
import { FiltroCulturaDto } from './dto/filtro-cultura.dto';
import { Cultura } from './entities/cultura.entity';

@ApiTags('Culturas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('culturas')
export class CulturasController {
  constructor(private readonly culturasService: CulturasService) {}

  @Post()
  @RequirePermissions('culturas:criar')
  @ApiOperation({ summary: 'Cadastra uma cultura' })
  @ApiResponse({ status: 201, description: 'Cultura cadastrada', type: Cultura })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma cultura com esse nome',
  })
  create(@Body() createCulturaDto: CreateCulturaDto) {
    return this.culturasService.create(createCulturaDto);
  }

  @Get()
  @RequirePermissions('culturas:listar')
  @ApiOperation({ summary: 'Lista as culturas' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  findAll(@Query() filtro: FiltroCulturaDto) {
    return this.culturasService.findAll(filtro);
  }

  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da cultura' })
  @RequirePermissions('culturas:visualizar')
  @ApiOperation({ summary: 'Mostra uma cultura' })
  @ApiResponse({ status: 200, description: 'Cultura encontrada', type: Cultura })
  @ApiResponse({ status: 404, description: 'Cultura não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da cultura' })
  @RequirePermissions('culturas:editar')
  @ApiOperation({ summary: 'Atualiza uma cultura' })
  @ApiResponse({ status: 200, description: 'Cultura atualizada', type: Cultura })
  @ApiResponse({ status: 404, description: 'Cultura não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma cultura com esse nome',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCulturaDto: UpdateCulturaDto,
  ) {
    return this.culturasService.update(id, updateCulturaDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da cultura' })
  @RequirePermissions('culturas:deletar')
  @ApiOperation({ summary: 'Exclui uma cultura' })
  @ApiResponse({ status: 200, description: 'Cultura removida' })
  @ApiResponse({ status: 404, description: 'Cultura não encontrada' })
  @ApiResponse({ status: 409, description: 'A cultura já foi plantada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.remove(id);
  }
}
