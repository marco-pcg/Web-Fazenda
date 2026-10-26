import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { database } from '../../db/knex-connection';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutoDto } from './dto/filtro-produto.dto';

@Injectable()
export class ProdutosRepositorio {
  private readonly table = 'produtos';

  async create(dados: CreateProdutoDto): Promise<Produto> {
    const [novo] = await database(this.table).insert(dados).returning('*');
    return novo;
  }

  async findAll(filtro: FiltroProdutoDto) {
    const pagina = filtro.pagina || 1;
    const limite = filtro.limite || 10;

    const dados = await this.consultaFiltrada(filtro)
      .select('*')
      .orderBy('nome')
      .limit(limite)
      .offset((pagina - 1) * limite);

    const [total] = await this.consultaFiltrada(filtro).count('id as count');

    return { dados, total: Number(total.count), pagina, limite };
  }

  findOne(id: string, trx: Knex = database): Promise<Produto | undefined> {
    return trx(this.table).where({ id }).first();
  }

  findByNomeOuChave(
    nome: string,
    chaveEstoque: string,
  ): Promise<Produto | undefined> {
    return database(this.table)
      .where('nome', 'ilike', nome)
      .orWhere({ chaveEstoque })
      .first();
  }

  async update(id: string, dados: UpdateProdutoDto): Promise<Produto> {
    const [atualizado] = await database(this.table)
      .where({ id })
      .update({ ...dados, updated_at: database.fn.now() })
      .returning('*');
    return atualizado;
  }

  private consultaFiltrada(filtro: FiltroProdutoDto) {
    const query = database(this.table);

    if (filtro.search) {
      query.where('nome', 'ilike', `%${filtro.search}%`);
    }
    if (filtro.ativo) {
      query.where('ativo', filtro.ativo === 'true');
    }
    return query;
  }
}
