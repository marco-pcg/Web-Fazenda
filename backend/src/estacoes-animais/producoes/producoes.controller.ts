import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProducoesService } from './producoes.service';
import { QueryProducaoDto } from './dto/query-producao.dto';
import { UsuarioLogado } from '../common/usuario-logado';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Produções')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('producoes')
export class ProducoesController {
  constructor(private readonly producoesService: ProducoesService) {}

  @Get()
  @RequirePermissions('producoes:listar')
  @ApiOperation({
    summary:
      'Lista produções com filtros por produto, período, rebanho, temporada e fazenda',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de produções' })
  @ApiResponse({
    status: 400,
    description: 'Filtros inválidos ou data inicial maior que a final',
  })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar' })
  listar(
    @Query() filtros: QueryProducaoDto,
    @Req() req: { user: UsuarioLogado },
  ) {
    return this.producoesService.listar(filtros, req.user);
  }
}
