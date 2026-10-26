import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { somarDias } from '../../common/datas';
import { UsuarioLogado } from '../shared/mercado.types';
import { Transacao } from './entities/transacao.entity';
import { FiltroTransacaoDto } from './dto/filtro-transacao.dto';

@Injectable()
export class TransacoesRepositorio {
  private readonly table = 'transacoes';

  async create(dados: Partial<Transacao>, trx: Knex.Transaction) {
    await trx(this.table).insert(dados);
  }

  async findAll(filtro: FiltroTransacaoDto, usuario: UsuarioLogado) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro, usuario)
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro, usuario).count(
      'id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  private consultaFiltrada(filtro: FiltroTransacaoDto, usuario: UsuarioLogado) {
    const query = database(this.table);

    if (usuario.perfil === 'aluno') {
      query.where((builder) => {
        builder
          .where('beneficiarioId', usuario.id)
          .orWhereIn(
            'vendaConjuntaId',
            database('ordens')
              .select('vendaConjuntaId')
              .where('usuarioId', usuario.id),
          );
      });
    }
    if (usuario.perfil === 'professor') {
      const turmasDoProfessor = database('turmas')
        .select('id')
        .where('professorId', usuario.id);

      query.where((builder) => {
        builder
          .whereIn(
            'fazendaId',
            database('fazendas')
              .select('id')
              .whereIn('turmaId', turmasDoProfessor),
          )
          .orWhereIn(
            'vendaConjuntaId',
            database('vendas_conjuntas')
              .select('id')
              .whereIn('turmaId', turmasDoProfessor),
          );
      });
    }
    if (usuario.perfil === 'comprador') {
      query.where('compradorId', usuario.id);
    }
    if (filtro.tipo) {
      query.where('tipo', filtro.tipo);
    }
    if (filtro.vendaConjuntaId) {
      query.where('vendaConjuntaId', filtro.vendaConjuntaId);
    }
    if (filtro.dataInicio) {
      query.where('created_at', '>=', filtro.dataInicio.slice(0, 10));
    }
    if (filtro.dataFim) {
      query.where('created_at', '<', somarDias(filtro.dataFim, 1));
    }
    return query;
  }
}
