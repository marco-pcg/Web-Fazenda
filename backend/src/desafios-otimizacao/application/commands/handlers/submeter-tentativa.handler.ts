import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { SubmeterTentativaCommand } from '../submeter-tentativa.command.js';
import { AvaliadorOtimizacaoService } from '../../../domain/services/avaliador-otimizacao.service.js';
import { IPROBLEMA_REPOSITORY } from '../../../infrastructure/repositories/problema.repository.interface.js';
import type { IProblemaRepository } from '../../../infrastructure/repositories/problema.repository.interface.js';
import { ITENTATIVA_REPOSITORY } from '../../../infrastructure/repositories/tentativa.repository.interface.js';
import type { ITentativaRepository } from '../../../infrastructure/repositories/tentativa.repository.interface.js';
import { TentativaSubmetidaEvent } from '../../events/tentativa-submetida.event.js';

@CommandHandler(SubmeterTentativaCommand)
export class SubmeterTentativaHandler implements ICommandHandler<SubmeterTentativaCommand> {
  constructor(
    @Inject(IPROBLEMA_REPOSITORY) private readonly problemaRepo: IProblemaRepository,
    @Inject(ITENTATIVA_REPOSITORY) private readonly tentativaRepo: ITentativaRepository,
    private readonly avaliadorService: AvaliadorOtimizacaoService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: SubmeterTentativaCommand) {
    const { problemaId, alunoId, valores } = command;

    const problema = await this.problemaRepo.findById(problemaId);
    if (!problema) {
      throw new NotFoundException('Desafio de otimização não encontrado.');
    }

    // Regra 11: Prazo e limite de tentativas
    if (new Date() > problema.prazoLimite) {
      throw new BadRequestException('O prazo para submissão deste desafio expirou.');
    }

    const tentativasAnteriores = await this.tentativaRepo.findByAlunoEProblema(alunoId, problemaId);
    if (tentativasAnteriores.length >= problema.limiteTentativas) {
      throw new ConflictException('Limite máximo de tentativas atingido.');
    }

    // Regra 12: Desbloqueio de nível (nota >= 7 no nível anterior)
    if (problema.nivel > 1) {
      const maiorNotaAnterior = await this.tentativaRepo.obterMaiorNotaNivelAnterior(alunoId, problema.nivel - 1);
      if (maiorNotaAnterior < 7.0) {
        throw new ForbiddenException('É necessário obter nota >= 7.0 no nível anterior para desbloquear este desafio.');
      }
    }

    // Regra 10: Avaliação e Correção
    const resultado = this.avaliadorService.avaliarTentativa(problema, valores);

    // Grava no banco de escrita
    const novaTentativa = await this.tentativaRepo.salvar({
      problemaId,
      alunoId,
      nivel: problema.nivel,
      valores,
      nota: resultado.nota,
      viavel: resultado.viavel,
      zAluno: resultado.zAluno,
      criadoEm: new Date(),
    });

    // Publica evento para atualizar a Tabela de Leitura (CQRS / Ranking)
    const publisher = this.eventPublisher.mergeObjectContext(novaTentativa);
    publisher.apply(new TentativaSubmetidaEvent(alunoId, problemaId, resultado.nota));
    publisher.commit();

    return novaTentativa;
  }
}
