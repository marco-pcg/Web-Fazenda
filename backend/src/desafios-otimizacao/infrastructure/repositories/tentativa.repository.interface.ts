import { TentativaEntity } from '../entities/tentativa.entity';
import { FiltrarTentativasDto } from '../../presentation/dtos/filtrar-tentativas.dto';

export const ITENTATIVA_REPOSITORY = 'ITentativaRepository';

export interface ITentativaRepository {
  salvar(tentativa: Partial<TentativaEntity>): Promise<TentativaEntity>;
  findById(id: string): Promise<TentativaEntity | null>;
  listarComFiltros(filtros: FiltrarTentativasDto): Promise<TentativaEntity[]>;
  findByAlunoEProblema(alunoId: string, problemaId: string): Promise<TentativaEntity[]>;
  obterMaiorNotaNivelAnterior(alunoId: string, nivelAnterior: number): Promise<number>;
}
