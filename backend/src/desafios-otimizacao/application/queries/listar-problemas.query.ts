import { FiltrarProblemaDto } from '../../presentation/dtos/filtrar-problema.dto';

export class ListarProblemasQuery {
  constructor(public readonly filtros: FiltrarProblemaDto) {}
}
