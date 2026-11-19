import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  PlanosPlantioRepository,
  type UsuarioPlanejamento,
} from './planos-plantio.repository';

export class ObterPlanoPlantioQuery {
  constructor(
    readonly id: string,
    readonly usuario: UsuarioPlanejamento,
  ) {}
}

@QueryHandler(ObterPlanoPlantioQuery)
export class ObterPlanoPlantioHandler implements IQueryHandler<ObterPlanoPlantioQuery> {
  constructor(private readonly planos: PlanosPlantioRepository) {}

  async execute({ id, usuario }: ObterPlanoPlantioQuery) {
    const plano = await this.planos.buscarPlano(id, usuario);
    if (!plano) {
      throw new NotFoundException('Plano de plantio não encontrado.');
    }
    return plano;
  }
}
