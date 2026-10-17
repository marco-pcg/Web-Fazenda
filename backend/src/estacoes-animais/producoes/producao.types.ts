export interface Producao {
  id: string;
  rebanho_id: string;
  temporada_id: string;
  produto: string;
  quantidade: number;
  fator_aplicado: number;
  created_at: Date;
}
