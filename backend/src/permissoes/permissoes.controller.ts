import { Controller, Get, Param, Query } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { FilterPermissoesDto } from './dto/filter-permissoes.dto';

@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) { }

  @Get()
  findAll(@Query() filter: FilterPermissoesDto) {
    return this.permissoesService.findAll(filter);
  }
}
