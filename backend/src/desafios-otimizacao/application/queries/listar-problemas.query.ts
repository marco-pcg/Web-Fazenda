import { FiltrarProblemaDto } from '../../presentation/dtos/filtrar-problema.dto.js';

export class ListarProblemasQuery {
  constructor(public readonly filtros: FiltrarProblemaDto) {}
}
