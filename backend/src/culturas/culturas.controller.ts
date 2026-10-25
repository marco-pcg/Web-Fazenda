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
  @RequirePermissions('CRIAR_CULTURA')
  @ApiOperation({ summary: 'Cadastra uma cultura' })
  create(@Body() dados: CreateCulturaDto) {
    return this.culturasService.create(dados);
  }

  @Get()
  @RequirePermissions('LISTAR_CULTURAS')
  @ApiOperation({ summary: 'Lista as culturas' })
  findAll(@Query() filtro: FiltroCulturaDto) {
    return this.culturasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_CULTURA')
  @ApiOperation({ summary: 'Mostra uma cultura' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('EDITAR_CULTURA')
  @ApiOperation({ summary: 'Atualiza uma cultura' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: UpdateCulturaDto,
  ) {
    return this.culturasService.update(id, dados);
  }

  @Delete(':id')
  @RequirePermissions('DELETAR_CULTURA')
  @ApiOperation({ summary: 'Exclui uma cultura que nunca foi plantada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturasService.remove(id);
  }
}
