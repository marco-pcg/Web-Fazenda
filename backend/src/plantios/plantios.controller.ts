import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PlantiosService } from './plantios.service';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { ColherPlantioDto } from './dto/colher-plantio.dto';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';

@ApiTags('Plantios')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plantios')
export class PlantiosController {
  constructor(private readonly plantiosService: PlantiosService) {}

  @Post()
  @RequirePermissions('CRIAR_PLANTIO')
  @ApiOperation({ summary: 'Planta uma cultura em um talhão' })
  create(@Body() dados: CreatePlantioDto) {
    return this.plantiosService.create(dados);
  }

  @Get()
  @RequirePermissions('LISTAR_PLANTIOS')
  @ApiOperation({ summary: 'Lista os plantios' })
  findAll(@Query() filtro: FiltroPlantioDto) {
    return this.plantiosService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_PLANTIO')
  @ApiOperation({ summary: 'Mostra um plantio' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plantiosService.findOne(id);
  }

  @Post(':id/colher')
  @RequirePermissions('COLHER_PLANTIO')
  @ApiOperation({ summary: 'Colhe um plantio' })
  colher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: ColherPlantioDto,
  ) {
    return this.plantiosService.colher(id, dados);
  }
}
