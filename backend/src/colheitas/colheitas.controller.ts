import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @RequirePermissions('colheitas:listar')
  @ApiOperation({ summary: 'Lista as colheitas' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  findAll(@Query() filtro: FiltroColheitaDto) {
    return this.colheitasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('colheitas:visualizar')
  @ApiOperation({ summary: 'Mostra uma colheita' })
  @ApiResponse({ status: 200, description: 'Colheita encontrada' })
  @ApiResponse({ status: 404, description: 'Colheita não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.colheitasService.findOne(id);
  }
}
