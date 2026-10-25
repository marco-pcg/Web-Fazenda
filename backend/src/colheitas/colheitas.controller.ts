import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ColheitasService } from './colheitas.service';
import { FiltroColheitaDto } from './dto/filtro-colheita.dto';

@ApiTags('Colheitas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('colheitas')
export class ColheitasController {
  constructor(private readonly colheitasService: ColheitasService) {}

  @Get()
  @RequirePermissions('LISTAR_COLHEITAS')
  @ApiOperation({ summary: 'Lista as colheitas' })
  findAll(@Query() filtro: FiltroColheitaDto) {
    return this.colheitasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('BUSCAR_COLHEITA')
  @ApiOperation({ summary: 'Mostra uma colheita' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.colheitasService.findOne(id);
  }
}
