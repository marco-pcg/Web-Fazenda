import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ITENTATIVA_REPOSITORY } from '../infrastructure/repositories/tentativa.repository.interface.js';
import type { ITentativaRepository } from '../infrastructure/repositories/tentativa.repository.interface.js';
import { FiltrarTentativasDto } from './dtos/filtrar-tentativas.dto.js';

@Controller('tentativas')
export class TentativasController {
  constructor(@Inject(ITENTATIVA_REPOSITORY) private readonly tentativaRepo: ITentativaRepository) {}

  @Get()
  listar(@Query() filtros: FiltrarTentativasDto) {
    return this.tentativaRepo.listarComFiltros(filtros);
  }

  @Get(':id')
  obter(@Param('id') id: string) {
    return this.tentativaRepo.findById(id);
  }
}