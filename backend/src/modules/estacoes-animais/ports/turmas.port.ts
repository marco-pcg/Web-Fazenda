export const TURMAS_PORT = 'TURMAS_PORT';

export interface TurmasPort {
  existe(turmaId: string): Promise<boolean>;
  professorEhDaTurma(turmaId: string, usuarioId: string): Promise<boolean>;
}
