import { database as bancoDeDados } from '../../db/knex-connection';
import { ProdutosRepositorio } from './produtos.repository';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CotacoesServico } from '../cotacoes/cotacoes.service';
import { UsuarioMercado } from '../shared/mercado.types';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { EditarProdutoDto } from './dto/editar-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';

@Injectable()
export class ProdutosServico {
  constructor(
    private readonly produtosRepositorio: ProdutosRepositorio,
    private readonly cotacoes: CotacoesServico,
  ) {}

  async listar(filtro: FiltroProdutosDto) {
    return this.produtosRepositorio.listar(filtro);
  }

  async criar(dto: CriarProdutoDto, usuario: UsuarioMercado) {
    this.exigirAdmin(usuario);
    try {
      return this.produtosRepositorio.criar(dto);
    } catch (erro) {
      if (this.ehViolacaoDeUnicidade(erro)) {
        throw new ConflictException('Nome ou chave de estoque já cadastrados.');
      }
      throw erro;
    }
  }

  async editar(id: string, dto: EditarProdutoDto, usuario: UsuarioMercado) {
    this.exigirAdmin(usuario);
    try {
      const produto = await bancoDeDados.transaction(async (transacaoBanco) => {
        const atual = await this.produtosRepositorio.buscarPorId(
          id,
          transacaoBanco,
          false,
          'update',
        );
        if (!atual) {
          throw new NotFoundException('Produto não encontrado.');
        }

        const atualizado = await this.produtosRepositorio.atualizar(
          id,
          dto,
          transacaoBanco,
        );
        await this.cotacoes.recalcularProduto(atualizado, transacaoBanco);
        return atualizado;
      });
      await this.cotacoes.invalidar(id);
      return produto;
    } catch (erro) {
      if (this.ehViolacaoDeUnicidade(erro)) {
        throw new ConflictException('Nome ou chave de estoque já cadastrados.');
      }
      throw erro;
    }
  }

  private exigirAdmin(usuario: UsuarioMercado): void {
    if (usuario.perfil !== 'admin') {
      throw new ForbiddenException('Somente o admin pode alterar produtos.');
    }
  }

  private ehViolacaoDeUnicidade(erro: unknown): boolean {
    return (
      typeof erro === 'object' &&
      erro !== null &&
      'code' in erro &&
      erro.code === '23505'
    );
  }
}
