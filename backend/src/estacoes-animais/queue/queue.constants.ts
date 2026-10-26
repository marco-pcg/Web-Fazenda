import { StatusTemporada } from '../../common/enums/enums';

export const FILA_ESTACOES_ANIMAIS = 'estacoes-animais';

export const JOB_AVANCAR_TEMPORADA = 'avancar-temporada';

export interface DadosAvancoTemporada {
  temporada_id: string;
  status_anterior: StatusTemporada;
}
