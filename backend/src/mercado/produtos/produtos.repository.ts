import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { paginar } from '../shared/paginar';
import { Produto } from '../produtos/entities/produto.entity';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { EditarProdutoDto } from './dto/editar-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';

@Injectable()
export class ProdutosRepository {
  async findAll(filtro: FiltroProdutosDto) {
    const query = database<Produto>('produtos');
    if (filtro.nome) {
      query.whereILike('nome', `%${filtro.nome}%`);
    }
    if (filtro.search) {
      query.whereILike('nome', `%${filtro.search}%`);
    }
    if (filtro.ativo !== undefined) {
      query.where('ativo', filtro.ativo === 'true');
    }
    return paginar(query.orderBy('nome'), filtro.page, filtro.limit);
  }

  async findOne(
    id: string,
    trx: Knex = database,
    ativo = false,
    lock?: 'update' | 'share',
  ): Promise<Produto | undefined> {
    const query = trx<Produto>('produtos').where({ id });
    if (ativo) {
      query.where({ ativo: true });
    }
    if (lock === 'update') {
      query.forUpdate();
    }
    if (lock === 'share') {
      query.forShare();
    }
    return query.first();
  }

  async create(dados: CriarProdutoDto): Promise<Produto> {
    const [produto] = await database<Produto>('produtos')
      .insert(dados)
      .returning('*');
    return produto;
  }

  async update(
    id: string,
    dados: EditarProdutoDto,
    trx: Knex.Transaction,
  ): Promise<Produto> {
    const [produto] = await trx<Produto>('produtos')
      .where({ id })
      .update({ ...dados, updated_at: new Date() })
      .returning('*');
    return produto;
  }
}
