export class TentativaSubmetidaEvent {
  constructor(
    public readonly alunoId: string,
    public readonly problemaId: string,
    public readonly nota: number,
  ) {}
}
