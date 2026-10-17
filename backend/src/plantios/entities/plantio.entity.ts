export class Plantio {
  id: string;
  talhao_id: string;
  cultura_id: string;
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
