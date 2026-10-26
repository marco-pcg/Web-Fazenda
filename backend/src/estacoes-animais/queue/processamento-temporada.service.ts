import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { TemporadasRepository } from '../temporadas/temporadas.repository';
import { TemporadasService } from '../temporadas/temporadas.service';
import { Temporada } from '../temporadas/temporada.types';
import { EstacoesRepository } from '../estacoes/estacoes.repository';
import { EventosClimaticosRepository } from '../eventos-climaticos/eventos-climaticos.repository';
import { EventosClimaticosService } from '../eventos-climaticos/eventos-climaticos.service';
import { RebanhosRepository } from '../rebanhos/rebanhos.repository';
import { Rebanho } from '../rebanhos/rebanho.types';
import { AlimentacoesRepository } from '../rebanhos/alimentacoes.repository';
import { AlimentacoesService } from '../rebanhos/alimentacoes.service';
import { EspeciesRepository } from '../especies/especies.repository';
import { Especie } from '../especies/especie.types';
import { ProducoesRepository } from '../producoes/producoes.repository';
import { FAZENDAS_PORT } from '../ports/fazendas.port';
import type { FazendasPort } from '../ports/fazendas.port';
import { ESTOQUE_PORT } from '../ports/estoque.port';
import type { EstoquePort } from '../ports/estoque.port';
import { AlvoEvento, StatusTemporada } from '../../common/enums/enums';

export interface ResumoProcessamento {
  temporada_id: string;
  status_anterior: StatusTemporada;
  rebanhos_processados: number;
  producoes_geradas: number;
  rebanhos_subnutridos: number;
}

@Injectable()
export class ProcessamentoTemporadaService {
  private readonly logger = new Logger(ProcessamentoTemporadaService.name);

  constructor(
    private readonly temporadasRepository: TemporadasRepository,
    private readonly temporadasService: TemporadasService,
    private readonly estacoesRepository: EstacoesRepository,
    private readonly eventosRepository: EventosClimaticosRepository,
    private readonly eventosService: EventosClimaticosService,
    private readonly rebanhosRepository: RebanhosRepository,
    private readonly alimentacoesRepository: AlimentacoesRepository,
    private readonly alimentacoesService: AlimentacoesService,
    private readonly especiesRepository: EspeciesRepository,
    private readonly producoesRepository: ProducoesRepository,
    @Inject(FAZENDAS_PORT) private readonly fazendasPort: FazendasPort,
    @Inject(ESTOQUE_PORT) private readonly estoquePort: EstoquePort,
  ) {}

  async processar(
    temporada_id: string,
    status_anterior: StatusTemporada,
  ): Promise<ResumoProcessamento> {
    const resumo: ResumoProcessamento = {
      temporada_id,
      status_anterior,
      rebanhos_processados: 0,
      producoes_geradas: 0,
      rebanhos_subnutridos: 0,
    };

    const temporada = await this.temporadasRepository.findById(temporada_id);
    if (!temporada || temporada.status !== StatusTemporada.PROCESSANDO) {
      this.logger.warn(
        `Temporada ${temporada_id} não está em processamento. Nada a fazer.`,
      );
      return resumo;
    }

    if (status_anterior === StatusTemporada.PLANEJADA) {
      await knex.transaction(async (trx) => {
        await this.temporadasService.ativar(temporada_id, trx);
      });
      this.logger.log(`Temporada ${temporada_id} ativada.`);
      return resumo;
    }

    await knex.transaction(async (trx) => {
      await this.fecharTemporada(temporada, resumo, trx);
    });

    this.logger.log(
      `Temporada ${temporada_id} encerrada: ${resumo.rebanhos_processados} rebanhos processados, ${resumo.producoes_geradas} produções geradas, ${resumo.rebanhos_subnutridos} rebanhos subnutridos.`,
    );
    return resumo;
  }

  async reverterFalhaDefinitiva(
    temporada_id: string,
    status_anterior: StatusTemporada,
  ): Promise<void> {
    const temporada = await this.temporadasRepository.findById(temporada_id);
    if (temporada && temporada.status === StatusTemporada.PROCESSANDO) {
      await this.temporadasRepository.update(temporada_id, {
        status: status_anterior,
      });
    }

    this.logger.error(
      `Falha definitiva ao processar a temporada ${temporada_id}. Status voltou para ${status_anterior}.`,
    );
  }

  private async fecharTemporada(
    temporada: Temporada,
    resumo: ResumoProcessamento,
    trx: Knex.Transaction,
  ) {
    const fazendas = await this.fazendasPort.listarPorTurma(temporada.turma_id);
    const rebanhos = await this.rebanhosRepository.listarPorFazendas(
      fazendas.map((fazenda) => fazenda.id),
      trx,
    );

    const estacao = await this.estacoesRepository.findById(
      temporada.estacao_id,
      trx,
    );
    const fatorEstacao = estacao ? Number(estacao.fator_produtividade) : 1;

    const eventos = await this.eventosRepository.listarAtivosPorTurma(
      temporada.turma_id,
      trx,
    );
    let fatorEventos = 1;
    for (const evento of eventos) {
      if (evento.alvo === AlvoEvento.PRODUTIVIDADE) {
        fatorEventos = fatorEventos * Number(evento.multiplicador);
      }
    }

    for (const rebanho of rebanhos) {
      if (rebanho.quantidade <= 0) {
        continue;
      }

      const especie = await this.especiesRepository.findById(
        rebanho.especie_id,
        trx,
      );
      if (!especie) {
        continue;
      }

      const proporcao = await this.alimentar(rebanho, temporada.id, trx);
      resumo.rebanhos_processados = resumo.rebanhos_processados + 1;
      if (proporcao < 1) {
        resumo.rebanhos_subnutridos = resumo.rebanhos_subnutridos + 1;
      }

      const gerouProducao = await this.produzir(
        rebanho,
        especie,
        proporcao * fatorEventos * fatorEstacao,
        temporada.id,
        trx,
      );
      if (gerouProducao) {
        resumo.producoes_geradas = resumo.producoes_geradas + 1;
      }

      if (proporcao >= 1) {
        const novaQuantidade = Math.floor(
          this.arredondar(
            rebanho.quantidade * (1 + Number(especie.taxa_crescimento)),
          ),
        );
        await this.rebanhosRepository.update(
          rebanho.id,
          { quantidade: novaQuantidade },
          trx,
        );
      }
    }

    await this.eventosService.encerrarAtivosDaTemporada(temporada.id, trx);
    await this.temporadasService.encerrarEAtivarProxima(temporada.id, trx);
  }

  private async alimentar(
    rebanho: Rebanho,
    temporada_id: string,
    trx: Knex.Transaction,
  ): Promise<number> {
    const alimentacao =
      await this.alimentacoesRepository.findDoRebanhoNaTemporada(
        rebanho.id,
        temporada_id,
        trx,
      );
    if (alimentacao) {
      return Number(alimentacao.proporcao_atendida);
    }

    const resultado = await this.alimentacoesService.alimentarRebanho(
      rebanho.id,
      { trx, temporada_id },
    );
    return resultado.proporcao_atendida;
  }

  private async produzir(
    rebanho: Rebanho,
    especie: Especie,
    fator: number,
    temporada_id: string,
    trx: Knex.Transaction,
  ): Promise<boolean> {
    const producaoExistente =
      await this.producoesRepository.findDoRebanhoNaTemporada(
        rebanho.id,
        temporada_id,
        trx,
      );
    if (producaoExistente) {
      return false;
    }

    const fator_aplicado = this.arredondar(fator);
    const quantidade = this.arredondar(
      rebanho.quantidade * Number(especie.producao_por_animal) * fator_aplicado,
    );

    await this.producoesRepository.insert(
      {
        rebanho_id: rebanho.id,
        temporada_id,
        produto: especie.produto,
        quantidade,
        fator_aplicado,
      },
      trx,
    );

    await this.estoquePort.creditarProduto(
      rebanho.fazenda_id,
      especie.produto,
      quantidade,
      trx,
    );

    return true;
  }

  private arredondar(valor: number): number {
    return Number(valor.toFixed(4));
  }
}
