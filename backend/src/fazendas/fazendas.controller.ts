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
  @RequirePermissions('CRIAR_FAZENDA')
  @ApiOperation({ summary: 'Cadastra uma fazenda' })
  create(@Body() dados: CreateFazendaDto) {
    return this.fazendasService.create(dados);
  }

  @Get()
  @RequirePermissions('LISTAR_FAZENDAS')
  @ApiOperation({ summary: 'Lista as fazendas' })
  findAll(@Query() filtro: FiltroFazendaDto) {
    return this.fazendasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_FAZENDA')
  @ApiOperation({ summary: 'Mostra a fazenda com os talhões e os recursos' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('EDITAR_FAZENDA')
  @ApiOperation({ summary: 'Atualiza uma fazenda' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: UpdateFazendaDto,
  ) {
    return this.fazendasService.update(id, dados);
  }

  @Delete(':id')
  @RequirePermissions('DELETAR_FAZENDA')
  @ApiOperation({ summary: 'Exclui uma fazenda sem plantios' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.remove(id);
  }
}
