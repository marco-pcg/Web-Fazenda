export class Ordem {
  id: string;
  tipo: string;
  modalidade: string;
  status: string;
  produtoId: string;
  usuarioId: string;
  fazendaId: string | null;
  vendaConjuntaId: string | null;
  ordemOrigemId: string | null;
  temporada: number | null;
  quantidade: number;
  precoUnitario: number | null;
  valorTotal: number | null;
  created_at: Date;
  updated_at: Date;
}
