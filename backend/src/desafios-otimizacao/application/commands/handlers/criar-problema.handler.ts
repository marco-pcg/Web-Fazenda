import { TipoObjetivo } from '../../domain/entities/problema.entity';

export class CriarProblemaCommand {
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
