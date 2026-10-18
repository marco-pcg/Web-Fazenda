import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { RebanhosRepository } from './rebanhos.repository';
import { AlimentacoesRepository } from './alimentacoes.repository';
import { EspeciesRepository } from '../especies/especies.repository';
import { TemporadasRepository } from '../temporadas/temporadas.repository';
import { FAZENDAS_PORT } from '../ports/fazendas.port';
import type { FazendasPort } from '../ports/fazendas.port';
import { ESTOQUE_PORT } from '../ports/estoque.port';
import type { EstoquePort } from '../ports/estoque.port';
import { SaudeRebanho } from '../../common/enums/enums';

export interface ResultadoAlimentacao {
  rebanho_id: string;
  racao_necessaria: number;
  racao_fornecida: number;
  proporcao_atendida: number;
  saude: SaudeRebanho;
}

@Injectable()
export class AlimentacoesService {
  constructor(
    private readonly rebanhosRepository: RebanhosRepository,
    private readonly alimentacoesRepository: AlimentacoesRepository,
    private readonly especiesRepository: EspeciesRepository,
    private readonly temporadasRepository: TemporadasRepository,
    @Inject(FAZENDAS_PORT) private readonly fazendasPort: FazendasPort,
    @Inject(ESTOQUE_PORT) private readonly estoquePort: EstoquePort,
  ) {}

  async alimentarRebanho(
    rebanho_id: string,
    opcoes: { trx?: Knex.Transaction; temporada_id?: string } = {},
  ): Promise<ResultadoAlimentacao> {
    if (opcoes.trx) {
      return this.executarAlimentacao(
        rebanho_id,
        opcoes.temporada_id,
        opcoes.trx,
      );
    }

    return knex.transaction((trx) =>
      this.executarAlimentacao(rebanho_id, opcoes.temporada_id, trx),
    );
  }

  private async executarAlimentacao(
    rebanho_id: string,
    temporadaRecebida: string | undefined,
    trx: Knex.Transaction,
  ): Promise<ResultadoAlimentacao> {
    const rebanho = await this.rebanhosRepository.findById(rebanho_id, trx);
    if (!rebanho) {
      throw new NotFoundException('Rebanho não encontrado.');
    }

    if (rebanho.quantidade <= 0) {
      throw new UnprocessableEntityException(
        'O rebanho está sem animais para alimentar.',
      );
    }

    const especie = await this.especiesRepository.findById(
      rebanho.especie_id,
      trx,
    );
    if (!especie) {
      throw new NotFoundException('Espécie não encontrada.');
    }

    const temporada_id = await this.descobrirTemporada(
      rebanho.fazenda_id,
      temporadaRecebida,
      trx,
    );

    if (temporada_id) {
      const jaAlimentado: unknown = await (
        this.alimentacoesRepository.findDoRebanhoNaTemporada as (
          rebanhoId: string,
          temporadaId: string,
          transaction: Knex.Transaction,
        ) => Promise<unknown>
      )(rebanho.id, temporada_id, trx);
      if (jaAlimentado) {
        throw new ConflictException(
          'Este rebanho já foi alimentado nesta temporada.',
        );
      }
    }

    const racao_necessaria = this.arredondar(
      rebanho.quantidade * Number(especie.consumo_racao_por_animal),
    );

    const estoque = Number(
      await this.estoquePort.obterRacao(rebanho.fazenda_id, trx),
    );
    const racao_fornecida = this.arredondar(
      Math.max(0, Math.min(estoque, racao_necessaria)),
    );

    if (racao_fornecida > 0) {
      await this.estoquePort.consumirRacao(
        rebanho.fazenda_id,
        racao_fornecida,
        trx,
      );
    }

    const proporcao_atendida =
      racao_necessaria > 0
        ? this.arredondar(racao_fornecida / racao_necessaria)
        : 1;
    const subnutrido = proporcao_atendida < 1;
    const saude = subnutrido ? SaudeRebanho.SUBNUTRIDO : SaudeRebanho.SAUDAVEL;

    await this.rebanhosRepository.update(
      rebanho.id,
      { saude, ultima_alimentacao_em: new Date() },
      trx,
    );

    await this.alimentacoesRepository.insert(
      {
        rebanho_id: rebanho.id,
        temporada_id: temporada_id,
        racao_necessaria,
        racao_fornecida,
        proporcao_atendida,
        subnutrido,
      },
      trx,
    );

    return {
      rebanho_id: rebanho.id,
      racao_necessaria,
      racao_fornecida,
      proporcao_atendida,
      saude,
    };
  }

  private async descobrirTemporada(
    fazenda_id: string,
    temporadaRecebida: string | undefined,
    trx: Knex.Transaction,
  ): Promise<string | null> {
    if (temporadaRecebida) {
      return temporadaRecebida;
    }

    const fazenda = await this.fazendasPort.buscarPorId(fazenda_id, trx);
    if (!fazenda || !fazenda.turmaId) {
      return null;
    }

    const ativa = await this.temporadasRepository.findAtivaDaTurma(
      fazenda.turmaId,
      trx,
    );
    return ativa ? ativa.id : null;
  }

  private arredondar(valor: number): number {
    return Number(valor.toFixed(4));
  }
}
