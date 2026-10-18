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
import { PlantiosService } from './plantios.service';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { ColherPlantioDto } from './dto/colher-plantio.dto';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';
import { Plantio } from './entities/plantio.entity';

@ApiTags('Plantios')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plantios')
export class PlantiosController {
  constructor(private readonly plantiosService: PlantiosService) {}

  @Post()
  @RequirePermissions('plantios:criar')
  @ApiOperation({ summary: 'Planta uma cultura em um talhão' })
  @ApiResponse({ status: 201, description: 'Plantio criado', type: Plantio })
  @ApiResponse({ status: 404, description: 'Talhão ou cultura não encontrado' })
  @ApiResponse({ status: 409, description: 'O talhão já está plantado' })
  @ApiResponse({
    status: 422,
    description: 'Fora da estação ou sem área ou água suficiente',
  })
  create(@Body() createPlantioDto: CreatePlantioDto) {
    return this.plantiosService.create(createPlantioDto);
  }

  @Get()
  @RequirePermissions('plantios:listar')
  @ApiOperation({ summary: 'Lista os plantios' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  findAll(@Query() filtro: FiltroPlantioDto) {
    return this.plantiosService.findAll(filtro);
  }

  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do plantio' })
  @RequirePermissions('plantios:visualizar')
  @ApiOperation({ summary: 'Mostra um plantio' })
  @ApiResponse({ status: 200, description: 'Plantio encontrado', type: Plantio })
  @ApiResponse({ status: 404, description: 'Plantio não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plantiosService.findOne(id);
  }

  @Post(':id/colher')
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do plantio' })
  @RequirePermissions('plantios:colher')
  @ApiOperation({ summary: 'Colhe um plantio' })
  @ApiResponse({ status: 201, description: 'Colheita registrada' })
  @ApiResponse({ status: 404, description: 'Plantio não encontrado' })
  @ApiResponse({ status: 409, description: 'O plantio já foi colhido' })
  @ApiResponse({
    status: 422,
    description: 'A data da colheita é antes do plantio',
  })
  colher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() colherPlantioDto: ColherPlantioDto,
  ) {
    return this.plantiosService.colher(id, colherPlantioDto);
  }
}
