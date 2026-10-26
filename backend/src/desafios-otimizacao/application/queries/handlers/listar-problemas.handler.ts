import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListarProblemasQuery } from '../listar-problemas.query';
import { ProblemaRepository } from '../../../infrastructure/repositories/problema.repository';

@QueryHandler(ListarProblemasQuery)
export class ListarProblemasHandler implements IQueryHandler<ListarProblemasQuery> {
  constructor(private readonly problemaRepo: ProblemaRepository) {}

  async execute(query: ListarProblemasQuery) {
    return this.problemaRepo.listarComFiltros(query.filtros);
  }
}
