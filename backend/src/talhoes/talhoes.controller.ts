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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Cadastra um talhão' })
  @ApiResponse({ status: 201, description: 'Talhão cadastrado' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  @ApiResponse({ status: 409, description: 'Já existe esse código na fazenda' })
  create(@Body() createTalhaoDto: CreateTalhaoDto) {
    return this.talhoesService.create(createTalhaoDto);
  }

  @Get()
  @RequirePermissions('talhoes:listar')
  @ApiOperation({ summary: 'Lista os talhões' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  findAll(@Query() filtro: FiltroTalhaoDto) {
    return this.talhoesService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('talhoes:visualizar')
  @ApiOperation({ summary: 'Mostra um talhão' })
  @ApiResponse({ status: 200, description: 'Talhão encontrado' })
  @ApiResponse({ status: 404, description: 'Talhão não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.talhoesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('talhoes:editar')
  @ApiOperation({ summary: 'Atualiza um talhão' })
  @ApiResponse({ status: 200, description: 'Talhão atualizado' })
  @ApiResponse({ status: 404, description: 'Talhão não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Talhão plantado ou código repetido',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTalhaoDto: UpdateTalhaoDto,
  ) {
    return this.talhoesService.update(id, updateTalhaoDto);
  }

  @Delete(':id')
  @RequirePermissions('talhoes:deletar')
  @ApiOperation({ summary: 'Exclui um talhão' })
  @ApiResponse({ status: 200, description: 'Talhão removido' })
  @ApiResponse({ status: 404, description: 'Talhão não encontrado' })
  @ApiResponse({ status: 409, description: 'O talhão tem plantios' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.talhoesService.remove(id);
  }
}
