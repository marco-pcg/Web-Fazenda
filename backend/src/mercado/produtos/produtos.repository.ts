import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database as bancoDeDados } from '../../db/knex-connection';
import { paginar } from '../shared/paginar';
import { Produto } from '../produtos/entities/produto.entity';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { EditarProdutoDto } from './dto/editar-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';

@Injectable()
export class ProdutosRepositorio {
  async listar(filtro: FiltroProdutosDto) {
    const consulta = bancoDeDados<Produto>('produtos');
    if (filtro.nome) {
      consulta.whereILike('nome', `%${filtro.nome}%`);
    }
    if (filtro.search) {
      consulta.whereILike('nome', `%${filtro.search}%`);
    }
    if (filtro.ativo !== undefined) {
      consulta.where('ativo', filtro.ativo === 'true');
    }
    return paginar(consulta.orderBy('nome'), filtro.page, filtro.limit);
  }

  async buscarPorId(
    id: string,
    transacaoBanco: Knex = bancoDeDados,
    ativo = false,
    bloqueio?: 'update' | 'share',
  ): Promise<Produto | undefined> {
    const consulta = transacaoBanco<Produto>('produtos').where({ id });
    if (ativo) {
      consulta.where({ ativo: true });
    }
    if (bloqueio === 'update') {
      consulta.forUpdate();
    }
    if (bloqueio === 'share') {
      consulta.forShare();
    }
    return consulta.first();
  }

  async criar(dados: CriarProdutoDto): Promise<Produto> {
    const [produto] = await bancoDeDados<Produto>('produtos')
      .insert(dados)
      .returning('*');
    return produto;
  }

  async atualizar(
    id: string,
    dados: EditarProdutoDto,
    transacaoBanco: Knex.Transaction,
  ): Promise<Produto> {
    const [produto] = await transacaoBanco<Produto>('produtos')
      .where({ id })
      .update({ ...dados, updated_at: new Date() })
      .returning('*');
    return produto;
  }
}
