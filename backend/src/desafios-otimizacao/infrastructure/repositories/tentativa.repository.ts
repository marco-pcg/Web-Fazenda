import { Injectable } from '@nestjs/common';
import { ITentativaRepository } from '../../domain/repositories/tentativa.repository.interface';
import { TentativaEntity } from '../../domain/entities/tentativa.entity';
import { FiltrarTentativasDto } from '../../presentation/dtos/filtrar-tentativas.dto';

@Injectable()
export class TentativaPrismaRepository implements ITentativaRepository {
  async salvar(tentativa: Partial<TentativaEntity>): Promise<TentativaEntity> {
    return {} as TentativaEntity;
  }

  async findById(id: string): Promise<TentativaEntity | null> {
    return null;
  }

  async listarComFiltros(filtros: FiltrarTentativasDto): Promise<TentativaEntity[]> {
    return [];
  }

  async findByAlunoEProblema(alunoId: string, problemaId: string): Promise<TentativaEntity[]> {
    return [];
  }

  async obterMaiorNotaNivelAnterior(alunoId: string, nivelAnterior: number): Promise<number> {
    return 0;
  }
}
