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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CulturasService } from './culturas.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';
import { FiltroCulturaDto } from './dto/filtro-cultura.dto';

@ApiTags('Culturas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('culturas')
export class CulturasController {
  constructor(private readonly culturasService: CulturasService) {}

  @Post()
  @RequirePermissions('culturas:criar')
  create(@Body() createCulturaDto: CreateCulturaDto) {
    return this.culturasService.create(createCulturaDto);
  }

  @Get()
  @RequirePermissions('culturas:listar')
  findAll(@Query() filtro: FiltroCulturaDto) {
    return this.culturasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('culturas:visualizar')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('culturas:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCulturaDto: UpdateCulturaDto,
  ) {
    return this.culturasService.update(id, updateCulturaDto);
  }

  @Delete(':id')
  @RequirePermissions('culturas:deletar')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.remove(id);
  }
}
