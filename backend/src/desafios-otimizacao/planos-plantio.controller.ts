import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { GerarPlanoPlantioCommand } from './gerar-plano-plantio.command';
import { ObterPlanoPlantioQuery } from './obter-plano-plantio.query';
import type { UsuarioPlanejamento } from './planos-plantio.repository';

@ApiTags('Planejamento de plantio')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('BUSCAR_FAZENDA', 'LISTAR_PLANTIOS')
@Controller('desafios-otimizacao/planos-plantio')
export class PlanosPlantioController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Post('talhoes/:talhaoId')
  @ApiOperation({
    summary: 'Gera e salva uma recomendação de plantio para o talhão',
  })
  gerar(
    @Param('talhaoId', ParseUUIDPipe) talhaoId: string,
    @CurrentUser() usuario: UsuarioPlanejamento,
  ) {
    return this.comandos.execute(
      new GerarPlanoPlantioCommand(talhaoId, usuario),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Recupera a recomendação gravada no momento do cálculo',
  })
  obter(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: UsuarioPlanejamento,
  ) {
    return this.consultas.execute(new ObterPlanoPlantioQuery(id, usuario));
  }
}
