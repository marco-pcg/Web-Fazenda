import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { UsuarioLogado } from '../shared/mercado.types';
import { Ordem } from './entities/ordem.entity';
import { FiltroOrdemDto } from './dto/filtro-ordem.dto';

@Injectable()
export class OrdensRepositorio {
  private readonly table = 'ordens';

  async create(dados: Partial<Ordem>, trx: Knex.Transaction): Promise<Ordem> {
    const [nova] = await trx(this.table).insert(dados).returning('*');
    return nova;
  }

  async findAll(filtro: FiltroOrdemDto, usuario: UsuarioLogado) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro, usuario)
      .select('ordens.*', 'produtos.nome as produtoNome')
      .orderBy('ordens.created_at', 'desc')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro, usuario).count(
      'ordens.id as count',
    );

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string, trx: Knex = database): Promise<Ordem | undefined> {
    return trx(this.table).where({ id }).first();
  }

  async update(id: string, dados: Partial<Ordem>, trx: Knex.Transaction) {
    await trx(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() });
  }

  fecharSeAberta(id: string, dados: Partial<Ordem>, trx: Knex.Transaction) {
    return trx(this.table)
      .where({ id, status: 'ABERTA' })
      .update({ ...dados, updated_at: database.fn.now() });
  }

  listarContribuicoes(
    vendaConjuntaId: string,
    status: string,
    trx: Knex = database,
  ): Promise<Ordem[]> {
    return trx(this.table)
      .where({ vendaConjuntaId, status, tipo: 'VENDA' })
      .orderBy('created_at');
  }

  buscarContribuicaoAberta(
    vendaConjuntaId: string,
    fazendaId: string,
    trx: Knex.Transaction,
  ): Promise<Ordem | undefined> {
    return trx(this.table)
      .where({ vendaConjuntaId, fazendaId, status: 'ABERTA' })
      .first();
  }

  async executarContribuicoes(
    vendaConjuntaId: string,
    preco: number,
    trx: Knex.Transaction,
  ) {
    await trx(this.table)
      .where({ vendaConjuntaId, status: 'ABERTA', tipo: 'VENDA' })
      .update({
        status: 'EXECUTADA',
        precoUnitario: preco,
        updated_at: database.fn.now(),
      });
  }

  private consultaFiltrada(filtro: FiltroOrdemDto, usuario: UsuarioLogado) {
    const query = database(this.table).join(
      'produtos',
      'produtos.id',
      'ordens.produtoId',
    );

    if (usuario.perfil === 'aluno') {
      query.where('ordens.usuarioId', usuario.id);
    }
    if (usuario.perfil === 'comprador') {
      query.where((builder) => {
        builder.where('ordens.usuarioId', usuario.id).orWhere({
          'ordens.tipo': 'VENDA',
          'ordens.modalidade': 'AVULSA',
          'ordens.status': 'ABERTA',
        });
      });
    }
    if (usuario.perfil === 'professor') {
      query.whereIn(
        'ordens.fazendaId',
        database('fazendas')
          .join('turmas', 'turmas.id', 'fazendas.turmaId')
          .select('fazendas.id')
          .where('turmas.professorId', usuario.id),
      );
    }
    if (filtro.tipo) {
      query.where('ordens.tipo', filtro.tipo);
    }
    if (filtro.status) {
      query.where('ordens.status', filtro.status);
    }
    if (filtro.modalidade) {
      query.where('ordens.modalidade', filtro.modalidade);
    }
    if (filtro.produtoId) {
      query.where('ordens.produtoId', filtro.produtoId);
    }
    if (filtro.search) {
      query.where('produtos.nome', 'ilike', `%${filtro.search}%`);
    }
    return query;
  }
}
