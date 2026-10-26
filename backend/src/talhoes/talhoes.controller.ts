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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @RequirePermissions('CRIAR_TALHAO')
  @ApiOperation({ summary: 'Cadastra um talhão' })
  create(@Body() dados: CreateTalhaoDto) {
    return this.talhoesService.create(dados);
  }

  @Get()
  @RequirePermissions('LISTAR_TALHOES')
  @ApiOperation({ summary: 'Lista os talhões' })
  findAll(@Query() filtro: FiltroTalhaoDto) {
    return this.talhoesService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_TALHAO')
  @ApiOperation({ summary: 'Mostra um talhão' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.talhoesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('EDITAR_TALHAO')
  @ApiOperation({ summary: 'Atualiza um talhão' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: UpdateTalhaoDto,
  ) {
    return this.talhoesService.update(id, dados);
  }

  @Delete(':id')
  @RequirePermissions('DELETAR_TALHAO')
  @ApiOperation({ summary: 'Exclui um talhão sem plantios' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.talhoesService.remove(id);
  }
}
