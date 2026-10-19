import { EstoqueRepositorio } from './estoque.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';

@Injectable()
export class EstoqueServico {
  constructor(
    private readonly estoqueRepositorio: EstoqueRepositorio,
    private readonly contextoMercadoRepositorio: ContextoMercadoRepositorio,
  ) {}

  async fazendaDoAluno(
    fazendaId: string,
    usuario: UsuarioMercado,
    transacaoBanco?: Knex.Transaction,
  ) {
    if (usuario.perfil !== 'aluno' && usuario.perfil !== 'admin') {
      throw new ForbiddenException('A operação exige um aluno.');
    }

    const fazenda = await this.contextoMercadoRepositorio.buscarFazenda(
      fazendaId,
      transacaoBanco,
    );

    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }
    if (usuario.perfil !== 'admin' && fazenda.usuario_id !== usuario.id) {
      throw new ForbiddenException('A fazenda não pertence ao aluno.');
    }
    if (!fazenda.turma_id) {
      throw new BadRequestException(
        'Vincule a fazenda a uma turma para acessar o mercado.',
      );
    }

    return fazenda;
  }

  async ajustar(
    fazendaId: string,
    chave: string,
    diferenca: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await this.estoqueRepositorio.garantir(fazendaId, transacaoBanco);
    const estoque = await this.estoqueRepositorio.buscarParaAtualizar(
      fazendaId,
      transacaoBanco,
    );
    if (!estoque) {
      throw new NotFoundException('Estoque não encontrado.');
    }

    const produtos =
      typeof estoque.produtos === 'string'
        ? (JSON.parse(estoque.produtos) as Record<string, number>)
        : { ...estoque.produtos };
    const atual = Number(produtos[chave] || 0);
    const proximo = Math.round((atual + diferenca) * 10000) / 10000;
    if (proximo < 0) {
      throw new BadRequestException('Quantidade insuficiente em estoque.');
    }
    produtos[chave] = proximo;

    await this.estoqueRepositorio.atualizarProdutos(
      fazendaId,
      produtos,
      transacaoBanco,
    );
  }

  async creditarColheita(
    fazendaId: string,
    culturaId: string,
    quantidade: number,
    transacaoBanco: Knex.Transaction,
  ): Promise<void> {
    await this.ajustar(
      fazendaId,
      `cultura:${culturaId}`,
      quantidade,
      transacaoBanco,
    );
  }

  async listar(filtro: FiltroEstoqueDto, usuario: UsuarioMercado) {
    if (!['admin', 'aluno', 'professor'].includes(usuario.perfil)) {
      throw new ForbiddenException('O estoque das fazendas não é público.');
    }

    return this.estoqueRepositorio.listar(filtro, usuario);
  }
}
