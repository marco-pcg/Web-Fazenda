export class Plantio {
  id: number;
  talhao_id: number;
  cultura_id: number;
  quantidade: number;
  area_usada: number;
  agua_usada: number;
  temporada: number;
  estacao: string;
  data_plantio: string;
  data_prevista_colheita: string;
  penalidade_rotacao: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
}
