export interface UsuarioMercado {
  id: string;
  perfil: string;
  permissoes: string[];
}

export interface FazendaMercado {
  id: string;
  usuario_id: string | null;
  turma_id: string | null;
  temporada_atual: number;
}
