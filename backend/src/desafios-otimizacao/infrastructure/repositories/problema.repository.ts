import { Injectable } from '@nestjs/common';
import { IProblemaRepository } from '../../domain/repositories/problema.repository.interface';
import { ProblemaEntity } from '../../domain/entities/problema.entity';
import { RestricaoEntity } from '../../domain/entities/restricao.entity';
import { VariavelEntity } from '../../domain/entities/variavel.entity';
import { FiltrarProblemaDto } from '../../presentation/dtos/filtrar-problema.dto';
// import { PrismaService } from '../persistence/prisma.service';

@Injectable()
export class ProblemaPrismaRepository implements IProblemaRepository {
  // constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ProblemaEntity | null> {
    // Exemplo Prisma:
    // return this.prisma.problema.findUnique({ where: { id }, include: { restricoes: true, variaveis: true, tentativas: true } });
    return null;
  }

  async listarComFiltros(filtros: FiltrarProblemaDto): Promise<ProblemaEntity[]> {
    return [];
  }

  async salvar(problema: Partial<ProblemaEntity>): Promise<ProblemaEntity> {
    return {} as ProblemaEntity;
  }

  async atualizar(id: string, problema: Partial<ProblemaEntity>): Promise<ProblemaEntity> {
    return {} as ProblemaEntity;
  }

  async deletar(id: string): Promise<void> {}

  async adicionarRestricao(problemaId: string, restricao: Partial<RestricaoEntity>): Promise<RestricaoEntity> {
    return {} as RestricaoEntity;
  }

  async removerRestricao(restricaoId: string): Promise<void> {}

  async adicionarVariavel(problemaId: string, variavel: Partial<VariavelEntity>): Promise<VariavelEntity> {
    return {} as VariavelEntity;
  }
}
