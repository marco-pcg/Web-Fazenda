import { Controller, Get, Param, Query } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { FilterPermissoesDto } from './dto/filter-permissoes.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) { }

  @Get()
  @RequirePermissions('LISTAR_PERMISSOES')
  findAll(@Query() filter: FilterPermissoesDto) {
    return this.permissoesService.findAll(filter);
  }
}
