import { Injectable, Logger } from '@nestjs/common';
import type { TurmasPort } from '../turmas.port';

@Injectable()
export class TurmasPortProvisorio implements TurmasPort {
  private readonly logger = new Logger(TurmasPortProvisorio.name);

  async existe(turmaId: string): Promise<boolean> {
    this.logger.log({
      error: `existe(${turmaId}) provisório: retornando true`,
    });
    return true;
  }

  async professorEhDaTurma(
    turmaId: string,
    usuarioId: string,
  ): Promise<boolean> {
    this.logger.log({
      error: `professorEhDaTurma(${turmaId}, ${usuarioId}) provisório: retornando true`,
    });
    return true;
  }
}
