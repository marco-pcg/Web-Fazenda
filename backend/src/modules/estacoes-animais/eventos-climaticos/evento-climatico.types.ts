import { AlvoEvento, StatusEvento, TipoEvento } from '../common/enums.js';

export interface EventoClimatico {
  id: string;
  temporada_id: string;
  turma_id: string;
  tipo: TipoEvento;
  alvo: AlvoEvento;
  multiplicador: number;
  descricao: string | null;
  status: StatusEvento;
  criado_por: string;
  created_at: Date;
}
