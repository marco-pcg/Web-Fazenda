import { Injectable } from '@nestjs/common';
import { IProblemaRepository } from './problema.repository.interface.js';
import { ProblemaEntity } from '../../domain/entities/problema.entity.js';
import type { RestricaoEntity } from '../../domain/entities/restricao.entity.js';
import type { VariavelEntity } from '../../domain/entities/variavel.entity.js';
import { FiltrarProblemaDto } from '../../presentation/dtos/filtrar-problema.dto.js';

@Injectable()
export class ProblemaRepository implements IProblemaRepository {
  private readonly problemas = new Map<string, ProblemaEntity>();

  async findById(id: string): Promise<ProblemaEntity | null> {
    const problema = this.problemas.get(id);
    return problema ?? null;
  }

  async listarComFiltros(filtros: FiltrarProblemaDto): Promise<ProblemaEntity[]> {
    return [...this.problemas.values()]
      .filter((problema) => !filtros.titulo || problema.titulo.toLowerCase().includes(filtros.titulo.toLowerCase()))
      .filter((problema) => filtros.nivel === undefined || problema.nivel === filtros.nivel)
      .filter((problema) => filtros.publicado === undefined || problema.publicado === filtros.publicado)
      .map((problema) => problema);
  }

  async salvar(problema: Partial<ProblemaEntity>): Promise<ProblemaEntity> {
    const entity = this.criarEntidade(problema);
    this.problemas.set(entity.id, entity);
    return entity;
  }

  async atualizar(id: string, problema: Partial<ProblemaEntity>): Promise<ProblemaEntity> {
    const atual = this.problemas.get(id);
    if (!atual) throw new Error(`Problema ${id} não encontrado`);
    const atualizado: ProblemaEntity = { ...atual, ...problema, id, temTentativas: atual.temTentativas };
    this.problemas.set(id, atualizado);
    return atualizado;
  }

  async deletar(id: string): Promise<void> {
    this.problemas.delete(id);
  }

  async adicionarRestricao(problemaId: string, restricao: Partial<RestricaoEntity>): Promise<RestricaoEntity> {
    const problema = this.obter(problemaId);
    const entity = { ...restricao, id: restricao.id ?? crypto.randomUUID(), problemaId } as RestricaoEntity;
    problema.restricoes.push(entity);
    this.problemas.set(problemaId, problema);
    return entity;
  }

  async removerRestricao(restricaoId: string): Promise<void> {
    for (const problema of this.problemas.values()) {
      problema.restricoes = problema.restricoes.filter((restricao) => restricao.id !== restricaoId);
    }
  }

  async adicionarVariavel(problemaId: string, variavel: Partial<VariavelEntity>): Promise<VariavelEntity> {
    const problema = this.obter(problemaId);
    const entity = { ...variavel, id: variavel.id ?? crypto.randomUUID(), problemaId } as VariavelEntity;
    problema.variaveis.push(entity);
    this.problemas.set(problemaId, problema);
    return structuredClone(entity);
  }

  private obter(id: string): ProblemaEntity {
    const problema = this.problemas.get(id);
    if (!problema) throw new Error(`Problema ${id} não encontrado`);
    return problema;
  }

  private criarEntidade(problema: Partial<ProblemaEntity>): ProblemaEntity {
    return {
      id: problema.id ?? crypto.randomUUID(),
      titulo: problema.titulo ?? '',
      descricao: problema.descricao ?? '',
      nivel: problema.nivel ?? 1,
      tipo: problema.tipo!,
      prazoLimite: problema.prazoLimite ?? new Date(),
      limiteTentativas: problema.limiteTentativas ?? 1,
      publicado: problema.publicado ?? false,
      funcaoObjetivo: problema.funcaoObjetivo ?? [],
      valorOtimoZ: problema.valorOtimoZ ?? 0,
      variaveis: problema.variaveis ?? [],
      restricoes: problema.restricoes ?? [],
      tentativas: problema.tentativas ?? [],
      verticesRegiaoViavel: problema.verticesRegiaoViavel ?? [],
      temTentativas: ProblemaEntity.prototype.temTentativas,
    };
  }
}
