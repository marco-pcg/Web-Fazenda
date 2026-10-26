import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { UsuarioLogado } from '../shared/mercado.types';
import { Cotacao } from './entities/cotacao.entity';
import { FiltroCotacaoDto } from './dto/filtro-cotacao.dto';

@Injectable()
export class CotacoesRepositorio {
  private readonly table = 'cotacoes';

  async findAll(filtro: FiltroCotacaoDto, usuario: UsuarioLogado) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro, usuario)
      .select('cotacoes.*', 'produtos.nome as produtoNome')
      .orderBy('cotacoes.updated_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro, usuario).count(
      'cotacoes.id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  async criarSeNaoExistir(
    produtoId: string,
    turmaId: string,
    temporada: number,
    preco: number,
    trx: Knex.Transaction,
  ) {
    await trx(this.table)
      .insert({ produtoId, turmaId, temporada, precoAtual: preco })
      .onConflict(['produtoId', 'turmaId', 'temporada'])
      .ignore();
  }

  buscarParaAtualizar(
    produtoId: string,
    turmaId: string,
    temporada: number,
    trx: Knex.Transaction,
  ): Promise<Cotacao | undefined> {
    return trx(this.table)
      .where({ produtoId, turmaId, temporada })
      .forUpdate()
      .first();
  }

  async atualizar(id: string, dados: Partial<Cotacao>, trx: Knex.Transaction) {
    await trx(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() });
  }

  private consultaFiltrada(filtro: FiltroCotacaoDto, usuario: UsuarioLogado) {
    const query = database(this.table).join(
      'produtos',
      'produtos.id',
      'cotacoes.produtoId',
    );

    if (usuario.perfil === 'aluno') {
      query.whereIn(
        'cotacoes.turmaId',
        database('fazendas').select('turmaId').where('usuarioId', usuario.id),
      );
    }
    if (usuario.perfil === 'professor') {
      query.whereIn(
        'cotacoes.turmaId',
        database('turmas').select('id').where('professorId', usuario.id),
      );
    }
    if (filtro.produtoId) {
      query.where('cotacoes.produtoId', filtro.produtoId);
    }
    if (filtro.turmaId) {
      query.where('cotacoes.turmaId', filtro.turmaId);
    }
    if (filtro.temporada) {
      query.where('cotacoes.temporada', filtro.temporada);
    }
    if (filtro.search) {
      query.where('produtos.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }
}
