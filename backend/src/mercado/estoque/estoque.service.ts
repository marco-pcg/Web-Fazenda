import { EstoqueRepository } from './estoque.repository';
import { ContextoMercadoRepository } from '../shared/contexto-mercado.repository';
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
export class EstoqueService {
  constructor(
    private readonly estoqueRepository: EstoqueRepository,
    private readonly contextoMercadoRepository: ContextoMercadoRepository,
  ) {}

  async fazendaDoAluno(
    fazendaId: string,
    usuario: UsuarioMercado,
    trx?: Knex.Transaction,
  ) {
    if (usuario.perfil !== 'aluno' && usuario.perfil !== 'admin') {
      throw new ForbiddenException('A operação exige um aluno.');
    }

    const fazenda = await this.contextoMercadoRepository.findFazenda(
      fazendaId,
      trx,
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
    trx: Knex.Transaction,
  ): Promise<void> {
    await this.estoqueRepository.ensure(fazendaId, trx);
    const estoque = await this.estoqueRepository.findForUpdate(fazendaId, trx);
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

    await this.estoqueRepository.updateProducts(fazendaId, produtos, trx);
  }

  async creditarColheita(
    fazendaId: string,
    culturaId: string,
    quantidade: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await this.ajustar(fazendaId, `cultura:${culturaId}`, quantidade, trx);
  }

  async listar(filtro: FiltroEstoqueDto, usuario: UsuarioMercado) {
    if (!['admin', 'aluno', 'professor'].includes(usuario.perfil)) {
      throw new ForbiddenException('O estoque das fazendas não é público.');
    }

    return this.estoqueRepository.findAll(filtro, usuario);
  }
}
