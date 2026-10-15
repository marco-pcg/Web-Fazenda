import { ProblemaEntity } from '../entities/problema.entity';
import { RestricaoEntity } from '../entities/restricao.entity';
import { VariavelEntity } from '../entities/variavel.entity';
import { FiltrarProblemaDto } from '../../presentation/dtos/filtrar-problema.dto';

// Token para Injeção de Dependências no NestJS
export const IPROBLEMA_REPOSITORY = 'IProblemaRepository';

export interface IProblemaRepository {
  findById(id: string): Promise<ProblemaEntity | null>;
  listarComFiltros(filtros: FiltrarProblemaDto): Promise<ProblemaEntity[]>;
  salvar(problema: Partial<ProblemaEntity>): Promise<ProblemaEntity>;
  atualizar(id: string, problema: Partial<ProblemaEntity>): Promise<ProblemaEntity>;
  deletar(id: string): Promise<void>;

  // Métodos específicos para sub-entidades vinculadas
  adicionarRestricao(problemaId: string, restricao: Partial<RestricaoEntity>): Promise<RestricaoEntity>;
  removerRestricao(restricaoId: string): Promise<void>;
  adicionarVariavel(problemaId: string, variavel: Partial<VariavelEntity>): Promise<VariavelEntity>;
}
