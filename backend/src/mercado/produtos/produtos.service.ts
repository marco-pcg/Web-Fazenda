import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProdutosRepositorio } from './produtos.repository';
import { CotacoesServico } from '../cotacoes/cotacoes.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutoDto } from './dto/filtro-produto.dto';

@Injectable()
export class ProdutosServico {
  constructor(
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly cotacoesServico: CotacoesServico,
  ) {}

  async create(dados: CreateProdutoDto) {
    const existe = await this.produtosRepositorio.findByNomeOuChave(
      dados.nome,
      dados.chaveEstoque,
    );
    if (existe) {
      throw new ConflictException(
        'Já existe um produto com esse nome ou chave de estoque.',
      );
    }

    return this.produtosRepositorio.create(dados);
  }

  findAll(filtro: FiltroProdutoDto) {
    return this.produtosRepositorio.findAll(filtro);
  }

  async update(id: string, dados: UpdateProdutoDto) {
    const produto = await this.produtosRepositorio.findOne(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    if (dados.nome) {
      const existe = await this.produtosRepositorio.findByNomeOuChave(
        dados.nome,
        produto.chaveEstoque,
      );
      if (existe && existe.id !== id) {
        throw new ConflictException('Já existe um produto com esse nome.');
      }
    }

    const atualizado = await this.produtosRepositorio.update(id, dados);
    await this.cotacoesServico.limparCache(id);
    return atualizado;
  }
}
