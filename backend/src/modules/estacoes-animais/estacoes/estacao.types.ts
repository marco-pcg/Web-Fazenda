import { NomeEstacao } from '../common/enums.js';

export interface Estacao {
  id: string;
  nome: NomeEstacao;
  ordem: number;
  fator_produtividade: number;
  fator_agua: number;
}
