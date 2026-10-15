import { Injectable } from '@nestjs/common';
import { ITentativaRepository } from './tentativa.repository.interface.js';
import { TentativaEntity } from '../../domain/entities/tentativa.entity.js';
import { FiltrarTentativasDto } from '../../presentation/dtos/filtrar-tentativas.dto.js';

@Injectable()
export class TentativaRepository implements ITentativaRepository {
  private readonly tentativas: TentativaEntity[] = [];

  async salvar(tentativa: Partial<TentativaEntity>): Promise<TentativaEntity> {
    const entity = Object.assign(new TentativaEntity(), {
      id: tentativa.id ?? crypto.randomUUID(),
      problemaId: tentativa.problemaId!,
      nivel: tentativa.nivel,
      alunoId: tentativa.alunoId!,
      turmaId: tentativa.turmaId,
      valores: tentativa.valores ?? {},
      nota: tentativa.nota ?? 0,
      viavel: tentativa.viavel ?? false,
      zAluno: tentativa.zAluno ?? 0,
      criadoEm: tentativa.criadoEm ?? new Date(),
    });
    this.tentativas.push(entity);
    return structuredClone(entity);
  }

  async findById(id: string): Promise<TentativaEntity | null> {
    const tentativa = this.tentativas.find((item) => item.id === id);
    return tentativa ? structuredClone(tentativa) : null;
  }

  async listarComFiltros(filtros: FiltrarTentativasDto): Promise<TentativaEntity[]> {
    return this.tentativas
      .filter((item) => !filtros.alunoId || item.alunoId === filtros.alunoId)
      .filter((item) => !filtros.problemaId || item.problemaId === filtros.problemaId)
      .map((item) => structuredClone(item));
  }

  async findByAlunoEProblema(alunoId: string, problemaId: string): Promise<TentativaEntity[]> {
    return this.tentativas.filter((item) => item.alunoId === alunoId && item.problemaId === problemaId).map((item) => structuredClone(item));
  }

  async obterMaiorNotaNivelAnterior(alunoId: string, nivelAnterior: number): Promise<number> {
    return Math.max(0, ...this.tentativas
      .filter((item) => item.alunoId === alunoId && item.nivel === nivelAnterior)
      .map((item) => item.nota));
  }
}
