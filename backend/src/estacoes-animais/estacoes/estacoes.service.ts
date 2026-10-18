import { ConflictException, Injectable } from '@nestjs/common';
import { EstacoesRepository } from './estacoes.repository';
import { Estacao } from './estacao.types';
import { CreateEstacaoDto } from './dto/create-estacao.dto';
import { QueryEstacaoDto } from './dto/query-estacao.dto';

@Injectable()
export class EstacoesService {
  constructor(private readonly estacoesRepository: EstacoesRepository) {}

  async listar(filtros: QueryEstacaoDto) {
    const resultado = await this.estacoesRepository.listar(
      filtros,
      filtros.page,
      filtros.limit,
    );

    return {
      data: resultado.data.map((estacao) => this.converterNumeros(estacao)),
      meta: resultado.meta,
    };
  }

  async criar(createEstacaoDto: CreateEstacaoDto) {
    const nomeExiste = await this.estacoesRepository.findByNome(
      createEstacaoDto.nome,
    );
    if (nomeExiste) {
      throw new ConflictException(
        `Já existe uma estação com o nome ${createEstacaoDto.nome}.`,
      );
    }

    const ordemExiste = await this.estacoesRepository.findByOrdem(
      createEstacaoDto.ordem,
    );
    if (ordemExiste) {
      throw new ConflictException(
        `Já existe uma estação com a ordem ${createEstacaoDto.ordem}.`,
      );
    }

    const estacao = await this.estacoesRepository.insert({
      nome: createEstacaoDto.nome,
      ordem: createEstacaoDto.ordem,
      fator_produtividade: createEstacaoDto.fator_produtividade ?? 1,
      fator_agua: createEstacaoDto.fator_agua ?? 1,
    });

    return this.converterNumeros(estacao);
  }

  private converterNumeros(estacao: Estacao): Estacao {
    return {
      ...estacao,
      fator_produtividade: Number(estacao.fator_produtividade),
      fator_agua: Number(estacao.fator_agua),
    };
  }
}
