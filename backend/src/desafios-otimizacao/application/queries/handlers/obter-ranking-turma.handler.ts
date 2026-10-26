import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ObterGraficoProblemaQuery } from '../obter-grafico-problema.query';
import { ProblemaRepository } from '../../../infrastructure/repositories/problema.repository';

@QueryHandler(ObterGraficoProblemaQuery)
export class ObterGraficoProblemaHandler implements IQueryHandler<ObterGraficoProblemaQuery> {
  constructor(private readonly problemaRepo: ProblemaRepository) {}

  async execute(query: ObterGraficoProblemaQuery) {
    const problema = await this.problemaRepo.findById(query.problemaId);
    if (!problema) {
      throw new NotFoundException('Desafio não encontrado.');
    }

    return {
      problemaId: problema.id,
      tipo: problema.tipo,
      eixos: {
        x: problema.variaveis[0]?.nome || 'x1',
        y: problema.variaveis[1]?.nome || 'x2',
      },
      verticesRegiaoViavel: problema.verticesRegiaoViavel || [],
      pontoOtimo: {
        valorOtimoZ: problema.valorOtimoZ,
      },
    };
  }
}
