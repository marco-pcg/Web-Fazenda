import { AggregateRoot } from '@nestjs/cqrs';

export class TentativaEntity extends AggregateRoot {
  id: string;
  problemaId: string;
  nivel?: number;
  alunoId: string;
  turmaId?: string;
  valores: Record<string, number>;
  nota: number;
  viavel: boolean;
  zAluno: number;
  criadoEm: Date;
}