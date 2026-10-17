import { database } from '../../db/knex-connection';
import { ProdutosRepository } from './produtos.repository';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CotacoesService } from '../cotacoes/cotacoes.service';
import { UsuarioMercado } from '../shared/mercado.types';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { EditarProdutoDto } from './dto/editar-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';

@Injectable()
export class ProdutosService {
  constructor(
    private readonly produtosRepository: ProdutosRepository,
    private readonly cotacoes: CotacoesService,
  ) {}

  async listar(filtro: FiltroProdutosDto) {
    return this.produtosRepository.findAll(filtro);
  }

  async criar(dto: CriarProdutoDto, usuario: UsuarioMercado) {
    this.exigirAdmin(usuario);
    try {
      return this.produtosRepository.create(dto);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Nome ou chave de estoque já cadastrados.');
      }
      throw error;
    }
  }

  async editar(id: string, dto: EditarProdutoDto, usuario: UsuarioMercado) {
    this.exigirAdmin(usuario);
    try {
      const produto = await database.transaction(async (trx) => {
        const atual = await this.produtosRepository.findOne(
          id,
          trx,
          false,
          'update',
        );
        if (!atual) {
          throw new NotFoundException('Produto não encontrado.');
        }

        const atualizado = await this.produtosRepository.update(id, dto, trx);
        await this.cotacoes.recalcularProduto(atualizado, trx);
        return atualizado;
      });
      await this.cotacoes.invalidar(id);
      return produto;
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Nome ou chave de estoque já cadastrados.');
      }
      throw error;
    }
  }

  private exigirAdmin(usuario: UsuarioMercado): void {
    if (usuario.perfil !== 'admin') {
      throw new ForbiddenException('Somente o admin pode alterar produtos.');
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
