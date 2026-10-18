import type { RestricaoEntity } from './restricao.entity.js';
import type { TentativaEntity } from './tentativa.entity.js';
import type { VariavelEntity } from './variavel.entity.js';

export enum TipoObjetivo {
  MAXIMIZACAO = 'MAXIMIZACAO',
  MINIMIZACAO = 'MINIMIZACAO',
}

export interface CoeficienteObjetivo {
  variavelId: string;
  coeficiente: number;
}

export interface VerticeRegiaoViavel {
  x: number;
  y: number;
}

export class ProblemaEntity {
  id: string;
  titulo: string; // Ex: "Otimização de Plantio: Milho vs Soja"
  descricao: string;
  nivel: number; // Ex: 1, 2, 3
  tipo: TipoObjetivo;
  prazoLimite: Date;
  limiteTentativas: number;
  publicado: boolean;

  // Função Objetivo: Z = c1*x1 + c2*x2 + ...
  funcaoObjetivo: CoeficienteObjetivo[];
  valorOtimoZ: number; // Z* calculado pelo professor ao criar

  variaveis: VariavelEntity[];
  restricoes: RestricaoEntity[];
  tentativas: TentativaEntity[];
  verticesRegiaoViavel: VerticeRegiaoViavel[];

  // Regra 13: Verifica se o problema possui tentativas vinculadas
  temTentativas(): boolean {
    return Array.isArray(this.tentativas) && this.tentativas.length > 0;
  }
}
