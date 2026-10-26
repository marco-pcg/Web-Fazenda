import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TemporadasService } from './temporadas.service';
import { CreateTemporadaDto } from './dto/create-temporada.dto';
import { QueryTemporadaDto } from './dto/query-temporada.dto';
import { TemporadaAvancoProducer } from '../queue/temporada-avanco.producer';
import { UsuarioLogado } from '../common/usuario-logado';
import { StatusTemporada } from '../../common/enums/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Temporadas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('temporadas')
export class TemporadasController {
  constructor(
    private readonly temporadasService: TemporadasService,
    private readonly temporadaAvancoProducer: TemporadaAvancoProducer,
  ) {}

  @Get()
  @RequirePermissions('temporadas:listar')
  @ApiOperation({
    summary:
      'Lista temporadas com filtros por turma e status (aluno só vê a própria turma)',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de temporadas' })
  @ApiResponse({ status: 400, description: 'Filtros inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(
    @Query() filtros: QueryTemporadaDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.temporadasService.listar(filtros, req.user);
  }

  @Post()
  @RequirePermissions('temporadas:criar')
  @ApiOperation({ summary: 'Cria uma temporada planejada para uma turma' })
  @ApiResponse({ status: 201, description: 'Temporada criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou turma de outro professor',
  })
  @ApiResponse({ status: 404, description: 'Turma ou estação não encontrada' })
  criar(
    @Body() createTemporadaDto: CreateTemporadaDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.temporadasService.criar(createTemporadaDto, req.user);
  }

  @Post(':id/avancar')
  @RequirePermissions('temporadas:avancar')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      'Avança a temporada em segundo plano: ativa uma planejada ou processa rebanhos, encerra a ativa e ativa a próxima',
  })
  @ApiResponse({ status: 202, description: 'Avanço da temporada iniciado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou turma de outro professor',
  })
  @ApiResponse({ status: 404, description: 'Temporada não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Temporada em processamento ou encerrada',
  })
  @ApiResponse({
    status: 422,
    description: 'Já existe uma temporada ativa na turma',
  })
  @ApiResponse({
    status: 503,
    description: 'Fila de processamento indisponível',
  })
  async avancar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: UsuarioLogado },
  ) {
    const resultado = await this.temporadasService.avancar(id, req.user);
    const job_id = await this.temporadaAvancoProducer.enfileirar(
      resultado.temporada_id,
      resultado.status_anterior,
    );

    return {
      temporada_id: resultado.temporada_id,
      status: StatusTemporada.PROCESSANDO,
      job_id,
    };
  }
}
