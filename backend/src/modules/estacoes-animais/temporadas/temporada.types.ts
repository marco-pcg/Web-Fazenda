import { StatusTemporada } from '../common/enums.js';

export interface Temporada {
  id: string;
  turma_id: string;
  estacao_id: string;
  numero: number;
  nome: string;
  status: StatusTemporada;
  data_inicio: Date | null;
  data_fim: Date | null;
  created_at: Date;
}
