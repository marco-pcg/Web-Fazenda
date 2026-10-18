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
  @ApiOperation({ summary: 'Cadastra uma fazenda' })
  @ApiResponse({ status: 201, description: 'Fazenda cadastrada' })
  @ApiResponse({ status: 404, description: 'Turma ou aluno não encontrado' })
  create(@Body() createFazendaDto: CreateFazendaDto) {
    return this.fazendasService.create(createFazendaDto);
  }

  @Get()
  @RequirePermissions('fazendas:listar')
  @ApiOperation({ summary: 'Lista as fazendas' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  findAll(@Query() filtro: FiltroFazendaDto) {
    return this.fazendasService.findAll(filtro);
  }

  @Get(':id')
  @RequirePermissions('fazendas:visualizar')
  @ApiOperation({ summary: 'Mostra a fazenda com os talhões e os recursos' })
  @ApiResponse({ status: 200, description: 'Fazenda encontrada' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('fazendas:editar')
  @ApiOperation({ summary: 'Atualiza uma fazenda' })
  @ApiResponse({ status: 200, description: 'Fazenda atualizada' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  @ApiResponse({
    status: 422,
    description: 'A água total ficaria menor que a já usada',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFazendaDto: UpdateFazendaDto,
  ) {
    return this.fazendasService.update(id, updateFazendaDto);
  }

  @Delete(':id')
  @RequirePermissions('fazendas:deletar')
  @ApiOperation({ summary: 'Exclui uma fazenda' })
  @ApiResponse({ status: 200, description: 'Fazenda removida' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  @ApiResponse({ status: 409, description: 'A fazenda tem plantios' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fazendasService.remove(id);
  }
}
