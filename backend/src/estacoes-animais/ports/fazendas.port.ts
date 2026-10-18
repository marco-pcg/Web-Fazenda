import type { Knex } from 'knex';
import { AlvoEvento } from '../../common/enums/enums';

export const FAZENDAS_PORT = 'FAZENDAS_PORT';

export interface Fazenda {
  id: string;
  nome: string;
  turmaId: string | null;
  usuarioId: string | null;
}

export interface Modificador {
  alvo: AlvoEvento;
  multiplicador: number;
  eventoId: string;
}

export interface FazendasPort {
  listarPorTurma(turmaId: string): Promise<Fazenda[]>;
  listarPorUsuario(usuarioId: string): Promise<Fazenda[]>;
  buscarPorId(id: string): Promise<Fazenda | null>;
  pertenceAoUsuario(fazendaId: string, usuarioId: string): Promise<boolean>;
  aplicarModificadorTurma(
    turmaId: string,
    modificador: Modificador,
    trx?: Knex.Transaction,
  ): Promise<void>;
  reverterModificadorTurma(
    turmaId: string,
    eventoId: string,
    trx?: Knex.Transaction,
  ): Promise<void>;
}
