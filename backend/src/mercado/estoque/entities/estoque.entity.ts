export class Estoque {
  fazendaId: string;
  racao: number;
  produtos: Record<string, number>;
  created_at: Date;
  updated_at: Date;
}
