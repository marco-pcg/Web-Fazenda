import { Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { database } from '../db/knex-connection';
import type {
  CulturaCandidata,
  RecomendacaoPlantio,
} from './planejamento.regras';

export interface UsuarioPlanejamento {
  id: string;
  perfil: string;
}

interface ContextoTalhao {
  area: number;
  status: string;
  aguaDisponivel: number;
  estacaoAtual: string;
  temporadaAtual: number;
}

export interface PlanoPlantio {
  id: string;
  talhaoId: string;
  temporada: number;
  estacao: string;
  recomendacao: RecomendacaoPlantio;
  criadoEm: Date;
}

@Injectable()
export class PlanosPlantioRepository {
  buscarTalhao(talhaoId: string, usuario: UsuarioPlanejamento, trx: Knex) {
    return this.talhoesAcessiveis(usuario, trx)
      .where('talhoes.id', talhaoId)
      .first<ContextoTalhao>(
        'talhoes.area',
        'talhoes.status',
        'fazendas.aguaDisponivel',
        'fazendas.estacaoAtual',
        'fazendas.temporadaAtual',
      );
  }

  listarCandidatas(talhaoId: string, contexto: ContextoTalhao, trx: Knex) {
    const plantioAnterior = trx('plantios')
      .select(trx.raw('1'))
      .where({ talhaoId, temporada: contexto.temporadaAtual - 1 })
      .where('plantios.culturaId', trx.ref('culturas.id'));

    return trx('culturas')
      .whereExists(
        trx('culturas_estacoes')
          .select(trx.raw('1'))
          .where({ estacao: contexto.estacaoAtual })
          .where('culturas_estacoes.culturaId', trx.ref('culturas.id')),
      )
      .select<CulturaCandidata[]>(
        'culturas.id',
        'culturas.nome',
        'culturas.areaPorUnidade',
        'culturas.aguaPorUnidade',
        'culturas.valorPorUnidade',
        trx.raw('exists (?) as ??', [plantioAnterior, 'penalidadeRotacao']),
      )
      .orderBy('culturas.id');
  }

  async salvar(dados: Omit<PlanoPlantio, 'id' | 'criadoEm'>, trx: Knex) {
    const [plano] = await trx<PlanoPlantio>('planos_plantio')
      .insert(dados)
      .returning('*');
    return plano;
  }

  buscarPlano(id: string, usuario: UsuarioPlanejamento) {
    return this.talhoesAcessiveis(usuario, database)
      .join('planos_plantio', 'planos_plantio.talhaoId', 'talhoes.id')
      .where('planos_plantio.id', id)
      .first<PlanoPlantio>('planos_plantio.*');
  }

  private talhoesAcessiveis(usuario: UsuarioPlanejamento, trx: Knex) {
    const query = trx('talhoes').join(
      'fazendas',
      'fazendas.id',
      'talhoes.fazendaId',
    );

    switch (usuario.perfil) {
      case 'admin':
        return query;
      case 'aluno':
        return query.where('fazendas.usuarioId', usuario.id);
      case 'professor':
        return query
          .join('turmas', 'turmas.id', 'fazendas.turmaId')
          .where('turmas.professorId', usuario.id);
      default:
        return query.whereRaw('false');
    }
  }
}
