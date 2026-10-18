export interface Producao {
  id: string;
  rebanho_id: string;
  temporada_id: string;
  produto: string;
  quantidade: number;
  fator_aplicado: number;
  created_at: Date;
}

export interface FiltrosProducao {
  produto?: string;
  data_inicio?: string;
  data_fim?: string;
  rebanho_id?: string;
  temporada_id?: string;
  fazenda_ids?: string[];
  search?: string;
}
