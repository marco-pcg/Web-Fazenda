export enum TipoObjetivo {
  MAXIMIZACAO = 'MAXIMIZACAO',
  MINIMIZACAO = 'MINIMIZACAO',
}

export interface CoeficienteObjetivo {
  variavelId: string;
  coeficiente: number;
}

export class ProblemaEntity {
  id: string;
  titulo: string;
  descricao: string;
  nivel: number;
  tipo: TipoObjetivo;
  prazoLimite: Date;
  limiteTentativas: number;
  publicado: boolean;

  funcaoObjetivo: CoeficienteObjetivo[];
  valorOtimoZ: number;

  variaveis: any[];
  restricoes: any[];
  tentativas: any[];

  temTentativas(): boolean {
    return Array.isArray(this.tentativas) && this.tentativas.length > 0;
  }
}
