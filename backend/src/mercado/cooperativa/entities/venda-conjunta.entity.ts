export class VendaConjunta {
  id: string;
  produtoId: string;
  turmaId: string;
  criadorId: string;
  temporada: number;
  status: string;
  valorBruto: number | null;
  taxa: number | null;
  valorLiquido: number | null;
  created_at: Date;
  updated_at: Date;
}
