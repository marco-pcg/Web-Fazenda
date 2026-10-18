import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  EventoClimaticoResponse,
  EventosClimaticosPaginadosResponse,
} from '../swagger.schemas';
import { EventosClimaticosService } from './eventos-climaticos.service';
import { CreateEventoClimaticoDto } from './dto/create-evento-climatico.dto';
import { QueryEventoClimaticoDto } from './dto/query-evento-climatico.dto';
import { UsuarioLogado } from '../common/usuario-logado';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Eventos climáticos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('eventos')
export class EventosClimaticosController {
  constructor(
    private readonly eventosClimaticosService: EventosClimaticosService,
  ) {}

  @Get()
  @RequirePermissions('eventos:listar')
  @ApiOperation({
    summary:
      'Lista eventos climáticos com filtros (aluno só vê os da própria turma)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de eventos',
    type: EventosClimaticosPaginadosResponse,
  })
  @ApiResponse({ status: 400, description: 'Filtros inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(
    @Query() filtros: QueryEventoClimaticoDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.eventosClimaticosService.listar(filtros, req.user);
  }

  @Post()
  @RequirePermissions('eventos:criar')
  @ApiOperation({
    summary:
      'Dispara um evento climático que afeta todas as fazendas da turma da temporada',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento criado e aplicado',
    type: EventoClimaticoResponse,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou turma de outro professor',
  })
  @ApiResponse({ status: 404, description: 'Temporada não encontrada' })
  @ApiResponse({
    status: 422,
    description:
      'Temporada não está ativa ou tipo, alvo e multiplicador incoerentes',
  })
  criar(
    @Body() dto: CreateEventoClimaticoDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.eventosClimaticosService.criar(dto, req.user);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID do evento climático',
  })
  @RequirePermissions('eventos:encerrar')
  @ApiOperation({
    summary: 'Encerra um evento climático e reverte seus efeitos',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento encerrado',
    type: EventoClimaticoResponse,
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou turma de outro professor',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({ status: 409, description: 'Evento já encerrado' })
  encerrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.eventosClimaticosService.encerrar(id, req.user);
  }
}
