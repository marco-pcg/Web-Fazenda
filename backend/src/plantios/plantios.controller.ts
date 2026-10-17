import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @RequirePermissions('plantios:criar')
  create(@Body() createPlantioDto: CreatePlantioDto) {
    return this.plantiosService.create(createPlantioDto);
  }

  @Get()
  @RequirePermissions('plantios:listar')
  findAll(@Query() filtro: FiltroPlantioDto) {
    return this.plantiosService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('plantios:visualizar')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantiosService.findOne(id);
  }

  @Post(':id/colher')
  @RequirePermissions('plantios:colher')
  colher(
    @Param('id', ParseIntPipe) id: number,
    @Body() colherPlantioDto: ColherPlantioDto,
  ) {
    return this.plantiosService.colher(id, colherPlantioDto);
  }
}
