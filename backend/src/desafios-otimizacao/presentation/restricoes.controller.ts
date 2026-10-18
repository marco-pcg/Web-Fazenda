import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { IPROBLEMA_REPOSITORY } from '../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../infrastructure/repositories/problema.repository.interface.js';
import { CriarRestricaoDto } from './dtos/criar-restricao.dto.js';

@Controller('restricoes')
export class RestricoesController {
  constructor(@Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository) {}

  @Post(':problemaId')
  adicionar(@Param('problemaId') problemaId: string, @Body() dto: CriarRestricaoDto) {
    return this.problemaRepo.adicionarRestricao(problemaId, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.problemaRepo.removerRestricao(id);
  }
}