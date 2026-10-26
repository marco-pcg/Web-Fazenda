import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { TipoObjetivo } from '../../domain/entities/problema.entity';
import { CriarProblemaCommand } from '../criar-problema.command.js';

@CommandHandler(CriarProblemaCommand)
export class CriarProblemaCommandHandler implements ICommandHandler<CriarProblemaCommand> {
  constructor(
    public readonly titulo: string,
    public readonly descricao: string,
    public readonly nivel: number,
    public readonly tipo: TipoObjetivo,
    public readonly prazoLimite: Date,
    public readonly limiteTentativas: number,
    public readonly funcaoObjetivo: { variavelId: string; coeficiente: number }[],
    public readonly valorOtimoZ: number,
  ) {}
}
