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
import { FazendasService } from './fazendas.service';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';
import { FiltroFazendaDto } from './dto/filtro-fazenda.dto';

@ApiTags('Fazendas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fazendas')
export class FazendasController {
  constructor(private readonly fazendasService: FazendasService) {}

  @Post()
  @RequirePermissions('fazendas:criar')
  create(@Body() createFazendaDto: CreateFazendaDto) {
    return this.fazendasService.create(createFazendaDto);
  }

  @Get()
  @RequirePermissions('fazendas:listar')
  findAll(@Query() filtro: FiltroFazendaDto) {
    return this.fazendasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('fazendas:visualizar')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('fazendas:editar')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFazendaDto: UpdateFazendaDto,
  ) {
    return this.fazendasService.update(id, updateFazendaDto);
  }

  @Delete(':id')
  @RequirePermissions('fazendas:deletar')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.remove(id);
  }
}
