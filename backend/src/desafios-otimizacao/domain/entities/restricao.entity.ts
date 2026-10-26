export enum OperadorRestricao {
  MENOR_IGUAL = '<=',
  MAIOR_IGUAL = '>=',
  IGUAL = '=',
}

export interface CoeficienteRestricao {
  variavelId: string;
  coeficiente: number;
}

export class RestricaoEntity {
  id: string;
  problemaId: string;
  descricao: string;
  coeficientes: CoeficienteRestricao[];
  operador: OperadorRestricao;
  limite: number;
}
