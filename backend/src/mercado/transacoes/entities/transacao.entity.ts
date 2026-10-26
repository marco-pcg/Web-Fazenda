export class Transacao {
  id: string;
  tipo: string;
  ordemId: string | null;
  vendaConjuntaId: string | null;
  compradorId: string | null;
  beneficiarioId: string | null;
  fazendaId: string | null;
  valor: number;
  created_at: Date;
}
