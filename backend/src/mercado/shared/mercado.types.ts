export interface UsuarioLogado {
  id: string;
  perfil: string;
  permissoes: string[];
}

export interface FazendaMercado {
  id: string;
  usuarioId: string | null;
  turmaId: string | null;
  temporadaAtual: number;
}
