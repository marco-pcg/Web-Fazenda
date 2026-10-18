import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IPROBLEMA_REPOSITORY } from '../../../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../../../infrastructure/repositories/problema.repository.interface.js';
import { CriarProblemaCommand } from '../criar-problema.command.js';

@CommandHandler(CriarProblemaCommand)
export class CriarProblemaHandler implements ICommandHandler<CriarProblemaCommand> {
  constructor(@Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository) {}

  execute(command: CriarProblemaCommand) {
    return this.problemaRepo.salvar({
      titulo: command.titulo,
      descricao: command.descricao,
      nivel: command.nivel,
      tipo: command.tipo,
      prazoLimite: command.prazoLimite,
      limiteTentativas: command.limiteTentativas,
      funcaoObjetivo: command.funcaoObjetivo,
      valorOtimoZ: command.valorOtimoZ,
      publicado: false,
      variaveis: [],
      restricoes: [],
      tentativas: [],
      verticesRegiaoViavel: [],
    });
  }
}
