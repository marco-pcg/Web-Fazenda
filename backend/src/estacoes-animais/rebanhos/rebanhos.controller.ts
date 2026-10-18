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
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AlimentacaoResponse,
  RebanhoResponse,
  RebanhosPaginadosResponse,
} from '../swagger.schemas';
import { RebanhosService } from './rebanhos.service';
import { CreateRebanhoDto } from './dto/create-rebanho.dto';
import { QueryRebanhoDto } from './dto/query-rebanho.dto';
import { UsuarioLogado } from '../common/usuario-logado';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Rebanhos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rebanhos')
export class RebanhosController {
  constructor(private readonly rebanhosService: RebanhosService) {}

  @Get()
  @RequirePermissions('rebanhos:listar')
  @ApiOperation({
    summary:
      'Lista rebanhos com filtros por espécie, saúde e fazenda (aluno só vê as fazendas dele)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de rebanhos',
    type: RebanhosPaginadosResponse,
  })
  @ApiResponse({ status: 400, description: 'Filtros inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(
    @Query() filtros: QueryRebanhoDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.rebanhosService.listar(filtros, req.user);
  }

  @Post()
  @RequirePermissions('rebanhos:criar')
  @ApiOperation({
    summary:
      'Adiciona animais a uma fazenda (soma no rebanho da espécie se ele já existir)',
  })
  @ApiResponse({
    status: 201,
    description: 'Rebanho criado ou atualizado',
    type: RebanhoResponse,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou fazenda de outro usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Espécie ou fazenda não encontrada',
  })
  @ApiResponse({ status: 422, description: 'Espécie inativa' })
  criar(@Body() dto: CreateRebanhoDto, @Req() req: { user: UsuarioLogado }) {
    return this.rebanhosService.criar(dto, req.user);
  }

  @Post(':id/alimentar')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID do rebanho',
  })
  @RequirePermissions('rebanhos:alimentar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Alimenta o rebanho consumindo ração do estoque (se faltar, o rebanho fica subnutrido)',
  })
  @ApiResponse({
    status: 200,
    description: 'Rebanho alimentado',
    type: AlimentacaoResponse,
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou fazenda de outro usuário',
  })
  @ApiResponse({ status: 404, description: 'Rebanho não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Rebanho já alimentado nesta temporada',
  })
  @ApiResponse({ status: 422, description: 'Rebanho sem animais' })
  alimentar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.rebanhosService.alimentar(id, req.user);
  }
}
