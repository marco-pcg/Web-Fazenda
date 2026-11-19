import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { database } from '../db/knex-connection';
import { recomendarPlantio } from './planejamento.regras';
import {
  PlanosPlantioRepository,
  type UsuarioPlanejamento,
} from './planos-plantio.repository';

export class GerarPlanoPlantioCommand {
  constructor(
    readonly talhaoId: string,
    readonly usuario: UsuarioPlanejamento,
  ) {}
}

@CommandHandler(GerarPlanoPlantioCommand)
export class GerarPlanoPlantioHandler implements ICommandHandler<GerarPlanoPlantioCommand> {
  constructor(private readonly planos: PlanosPlantioRepository) {}

  execute({ talhaoId, usuario }: GerarPlanoPlantioCommand) {
    return database.transaction(
      async (trx) => {
        const contexto = await this.planos.buscarTalhao(talhaoId, usuario, trx);
        if (!contexto) {
          throw new NotFoundException('Talhão não encontrado.');
        }
        if (contexto.status !== 'livre') {
          throw new ConflictException(
            'O talhão precisa estar livre para gerar um plano.',
          );
        }

        const culturas = await this.planos.listarCandidatas(
          talhaoId,
          contexto,
          trx,
        );
        const recomendacao = recomendarPlantio(
          contexto.area,
          contexto.aguaDisponivel,
          culturas,
        );
        if (!recomendacao) {
          throw new UnprocessableEntityException(
            'Nenhuma cultura cabe nos recursos disponíveis nesta estação.',
          );
        }

        return this.planos.salvar(
          {
            talhaoId,
            temporada: contexto.temporadaAtual,
            estacao: contexto.estacaoAtual,
            recomendacao,
          },
          trx,
        );
      },
      { isolationLevel: 'repeatable read' },
    );
  }
}
