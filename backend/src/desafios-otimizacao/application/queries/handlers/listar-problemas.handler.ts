import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListarProblemasQuery } from '../listar-problemas.query.js';
import { Inject } from '@nestjs/common';
import { IPROBLEMA_REPOSITORY } from '../../../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../../../infrastructure/repositories/problema.repository.interface.js';

@QueryHandler(ListarProblemasQuery)
export class ListarProblemasHandler implements IQueryHandler<ListarProblemasQuery> {
  constructor(@Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository) {}

  async execute(query: ListarProblemasQuery) {
    return this.problemaRepo.listarComFiltros(query.filtros);
  }
}
