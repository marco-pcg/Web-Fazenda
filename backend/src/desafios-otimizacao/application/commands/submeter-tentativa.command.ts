export class SubmeterTentativaCommand {
  constructor(
    public readonly problemaId: string,
    public readonly alunoId: string,
    public readonly valores: Record<string, number>,
  ) {}
}
