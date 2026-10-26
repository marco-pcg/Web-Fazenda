import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { EstoqueRepositorio } from './estoque.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import { UsuarioLogado } from '../shared/mercado.types';
import { FiltroEstoqueDto } from './dto/filtro-estoque.dto';

@Injectable()
export class EstoqueServico {
  constructor(
    private readonly estoqueRepositorio: EstoqueRepositorio,
    private readonly contextoRepositorio: ContextoMercadoRepositorio,
  ) {}

  findAll(filtro: FiltroEstoqueDto, usuario: UsuarioLogado) {
    if (usuario.perfil === 'comprador') {
      throw new ForbiddenException('O estoque das fazendas não é público.');
    }
    return this.estoqueRepositorio.findAll(filtro, usuario);
  }

  async fazendaDoAluno(
    fazendaId: string,
    usuario: UsuarioLogado,
    trx: Knex.Transaction,
  ) {
    const fazenda = await this.contextoRepositorio.buscarFazenda(
      fazendaId,
      trx,
    );
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }
    if (usuario.perfil !== 'admin' && fazenda.usuarioId !== usuario.id) {
      throw new ForbiddenException('Essa fazenda não é sua.');
    }
    if (!fazenda.turmaId) {
      throw new UnprocessableEntityException(
        'A fazenda precisa estar ligada a uma turma para usar o mercado.',
      );
    }
    return fazenda;
  }

  async ajustar(
    fazendaId: string,
    chave: string,
    diferenca: number,
    trx: Knex.Transaction,
  ) {
    await this.estoqueRepositorio.criarSeNaoExistir(fazendaId, trx);
    const estoque = await this.estoqueRepositorio.buscarParaAtualizar(
      fazendaId,
      trx,
    );
    if (!estoque) {
      throw new NotFoundException('Estoque não encontrado.');
    }

    const produtos = { ...estoque.produtos };
    const atual = Number(produtos[chave] || 0);
    const novo = Number((atual + diferenca).toFixed(4));

    if (novo < 0) {
      throw new UnprocessableEntityException(
        'Quantidade insuficiente no estoque.',
      );
    }

    produtos[chave] = novo;
    await this.estoqueRepositorio.salvarProdutos(fazendaId, produtos, trx);
  }

  creditarColheita(
    fazendaId: string,
    culturaId: string,
    quantidade: number,
    trx: Knex.Transaction,
  ) {
    return this.ajustar(fazendaId, 'cultura:' + culturaId, quantidade, trx);
  }
}
