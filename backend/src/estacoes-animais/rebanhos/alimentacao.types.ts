export interface Alimentacao {
  id: string;
  rebanho_id: string;
  temporada_id: string | null;
  racao_necessaria: number;
  racao_fornecida: number;
  proporcao_atendida: number;
  subnutrido: boolean;
  created_at: Date;
}
