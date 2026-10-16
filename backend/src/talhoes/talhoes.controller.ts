import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { TalhoesService } from './talhoes.service';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { UpdateTalhaoDto } from './dto/update-talhao.dto';
import { FiltroTalhaoDto } from './dto/filtro-talhao.dto';

@ApiTags('Talhões')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('talhoes')
export class TalhoesController {
  constructor(private readonly talhoesService: TalhoesService) {}

  @Post()
  @RequirePermissions('talhoes:criar')
  create(@Body() createTalhaoDto: CreateTalhaoDto) {
    return this.talhoesService.create(createTalhaoDto);
  }

  @Get()
  @RequirePermissions('talhoes:listar')
  findAll(@Query() filtro: FiltroTalhaoDto) {
    return this.talhoesService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('talhoes:visualizar')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.talhoesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('talhoes:editar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTalhaoDto: UpdateTalhaoDto,
  ) {
    return this.talhoesService.update(id, updateTalhaoDto);
  }

  @Delete(':id')
  @RequirePermissions('talhoes:deletar')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.talhoesService.remove(id);
  }
}
