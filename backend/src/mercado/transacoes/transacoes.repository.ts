import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { UsuarioMercado } from '../shared/mercado.types';
import { paginar } from '../shared/paginar';
import { FiltroTransacoesDto } from './dto/filtro-transacoes.dto';
import { Transacao } from './entities/transacao.entity';

type DadosNovaTransacao = Omit<Partial<Transacao>, 'id' | 'created_at'> &
  Pick<Transacao, 'tipo' | 'valor'>;

@Injectable()
export class TransacoesRepositorio {
  async criar(
    dados: DadosNovaTransacao,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await transacaoBanco('transacoes').insert(dados);
  }

  async listar(
    filtro: FiltroTransacoesDto,
    usuario: UsuarioMercado,
    extrato = false,
  ) {
    const consulta = bancoDeDados('transacoes as tr').select('tr.*');
    if (extrato) {
      consulta.join('vendas_conjuntas as vc', 'vc.id', 'tr.venda_conjunta_id');
      if (usuario.perfil === 'aluno') {
        consulta.whereExists(function () {
          this.select('o.id')
            .from('ordens as o')
            .whereRaw('o.venda_conjunta_id = vc.id')
            .where('o.usuario_id', usuario.id);
        });
      }
      if (usuario.perfil === 'professor') {
        consulta
          .join('turmas as t', 't.id', 'vc.turma_id')
          .where('t.professor_id', usuario.id);
      }
    } else {
      if (usuario.perfil === 'aluno') {
        consulta.where((consultaAgrupada) => {
          consultaAgrupada
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
        consulta.where((consultaAgrupada) => {
          consultaAgrupada
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
      consulta.where('tr.comprador_usuario_id', usuario.id);
    }
    if (filtro.tipo) {
      consulta.where('tr.tipo', filtro.tipo);
    }
    if (filtro.venda_conjunta_id) {
      consulta.where(
        extrato ? 'vc.id' : 'tr.venda_conjunta_id',
        filtro.venda_conjunta_id,
      );
    }
    if (filtro.data_inicio) {
      consulta.where('tr.created_at', '>=', filtro.data_inicio);
    }
    if (filtro.data_fim) {
      consulta.where('tr.created_at', '<', `${filtro.data_fim}T23:59:59.999Z`);
    }
    return paginar(
      consulta.orderBy('tr.created_at', 'desc'),
      filtro.page,
      filtro.limit,
    );
  }
}
