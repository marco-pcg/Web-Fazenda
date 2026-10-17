import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroTransacoesDto } from './dto/filtro-transacoes.dto';
import { Transacao } from './entities/transacao.entity';

type TransacaoInsert = Omit<Partial<Transacao>, 'id' | 'created_at'> &
  Pick<Transacao, 'tipo' | 'valor'>;

@Injectable()
export class TransacoesRepository {
  async create(dados: TransacaoInsert, trx: Knex.Transaction): Promise<void> {
    await trx('transacoes').insert(dados);
  }

  async findAll(
    filtro: FiltroTransacoesDto,
    usuario: UsuarioMercado,
    extrato = false,
  ) {
    const query = database('transacoes as tr').select('tr.*');
    if (extrato) {
      query.join('vendas_conjuntas as vc', 'vc.id', 'tr.venda_conjunta_id');
      if (usuario.perfil === 'aluno') {
        query.whereExists(function () {
          this.select('o.id')
            .from('ordens as o')
            .whereRaw('o.venda_conjunta_id = vc.id')
            .where('o.usuario_id', usuario.id);
        });
      }
      if (usuario.perfil === 'professor') {
        query
          .join('turmas as t', 't.id', 'vc.turma_id')
          .where('t.professor_id', usuario.id);
      }
    } else {
      if (usuario.perfil === 'aluno') {
        query.where((builder) => {
          builder
            .where('tr.beneficiario_usuario_id', usuario.id)
            .orWhereExists(function () {
              this.select('o.id')
                .from('ordens as o')
                .whereRaw('o.venda_conjunta_id = tr.venda_conjunta_id')
                .where('o.usuario_id', usuario.id);
            });
        });
      }
      if (usuario.perfil === 'professor') {
        query.where((builder) => {
          builder
            .whereExists(function () {
              this.select('f.id')
                .from('fazendas as f')
                .join('turmas as t', 't.id', 'f.turma_id')
                .whereRaw('f.id = tr.fazenda_id')
                .where('t.professor_id', usuario.id);
            })
            .orWhereExists(function () {
              this.select('vc.id')
                .from('vendas_conjuntas as vc')
                .join('turmas as t', 't.id', 'vc.turma_id')
                .whereRaw('vc.id = tr.venda_conjunta_id')
                .where('t.professor_id', usuario.id);
            });
        });
      }
    }
    if (usuario.perfil === 'comprador') {
      query.where('tr.comprador_usuario_id', usuario.id);
    }
    if (filtro.tipo) {
      query.where('tr.tipo', filtro.tipo);
    }
    if (filtro.venda_conjunta_id) {
      query.where(
        extrato ? 'vc.id' : 'tr.venda_conjunta_id',
        filtro.venda_conjunta_id,
      );
    }
    if (filtro.data_inicio) {
      query.where('tr.created_at', '>=', filtro.data_inicio);
    }
    if (filtro.data_fim) {
      query.where('tr.created_at', '<', `${filtro.data_fim}T23:59:59.999Z`);
    }
    return paginar(
      query.orderBy('tr.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }
}
