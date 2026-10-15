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
  descricao: string; // Ex: "Disponibilidade de água irrigada"
  coeficientes: CoeficienteRestricao[]; // Ex: [{ variavelId: 'x1', coeficiente: 20 }]
  operador: OperadorRestricao;
  limite: number; // Ex: 2500 (Direito da equação - RHS)
}
