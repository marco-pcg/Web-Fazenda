import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ObterGraficoProblemaQuery } from '../obter-grafico-problema.query.js';
import { IPROBLEMA_REPOSITORY } from '../../../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../../../infrastructure/repositories/problema.repository.interface.js';

@QueryHandler(ObterGraficoProblemaQuery)
export class ObterGraficoProblemaHandler implements IQueryHandler<ObterGraficoProblemaQuery> {
  constructor(@Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository) {}

  async execute(query: ObterGraficoProblemaQuery) {
    const problema = await this.problemaRepo.findById(query.problemaId);
    if (!problema) {
      throw new NotFoundException('Desafio não encontrado.');
    }

    // Retorna a estrutura necessária para a plotagem dos vértices da região viável no Frontend
    return {
      problemaId: problema.id,
      tipo: problema.tipo,
      eixos: {
        x: problema.variaveis[0]?.nome || 'x1',
        y: problema.variaveis[1]?.nome || 'x2',
      },
      // Calculado a partir do sistema de equações lineares do problema
      verticesRegiaoViavel: problema.verticesRegiaoViavel || [],
      pontoOtimo: {
        valorOtimoZ: problema.valorOtimoZ,
      },
    };
  }
}
