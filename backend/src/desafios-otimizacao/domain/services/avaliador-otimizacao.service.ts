import { Injectable } from '@nestjs/common';
import { TipoObjetivo } from '../entities/problema.entity.js';
import type { ProblemaEntity } from '../entities/problema.entity.js';
import { OperadorRestricao } from '../entities/restricao.entity.js';
import type { RestricaoEntity } from '../entities/restricao.entity.js';

@Injectable()
export class AvaliadorOtimizacaoService {
  /**
   * Avalia a submissão do aluno e calcula a nota.
   * Regra 10: Resposta inviável -> nota 0.
   * Viável (MAX) -> (Z_aluno / Z*) * 10
   * Viável (MIN) -> (Z* / Z_aluno) * 10
   */
  avaliarTentativa(
    problema: ProblemaEntity,
    valoresAluno: Record<string, number>, // Ex: { x1: 30, x2: 40 }
  ): { viavel: boolean; zAluno: number; nota: number } {

    // 1. Validar se atende a TODAS as restrições (Regra 10)
    const viavel = problema.restricoes.every((restricao: RestricaoEntity) =>
      this.validarRestricao(restricao, valoresAluno),
    );

    if (!viavel) {
      return { viavel: false, zAluno: 0, nota: 0 };
    }

    // 2. Calcular Z do Aluno
    const zAluno = problema.funcaoObjetivo.reduce((acc, obj) => {
      const valorVariavel = valoresAluno[obj.variavelId] ?? 0;
      return acc + obj.coeficiente * valorVariavel;
    }, 0);

    const zOtimo = problema.valorOtimoZ;
    let proporcao = 0;

    // 3. Calcular Nota
    if (problema.tipo === TipoObjetivo.MAXIMIZACAO) {
      proporcao = zOtimo !== 0 ? zAluno / zOtimo : 0;
    } else {
      proporcao = zAluno !== 0 ? zOtimo / zAluno : 0;
    }

    // Limita a nota entre 0 e 10
    const nota = Math.min(Math.max(proporcao * 10, 0), 10);

    return {
      viavel: true,
      zAluno: Number(zAluno.toFixed(2)),
      nota: Number(nota.toFixed(2)),
    };
  }

  private validarRestricao(
    restricao: RestricaoEntity,
    valores: Record<string, number>,
  ): boolean {
    const lhs = restricao.coeficientes.reduce((acc, item) => {
      const val = valores[item.variavelId] ?? 0;
      return acc + item.coeficiente * val;
    }, 0);

    switch (restricao.operador) {
      case OperadorRestricao.MENOR_IGUAL:
        return lhs <= restricao.limite + 1e-6; // Tolerância para ponto flutuante
      case OperadorRestricao.MAIOR_IGUAL:
        return lhs >= restricao.limite - 1e-6;
      case OperadorRestricao.IGUAL:
        return Math.abs(lhs - restricao.limite) <= 1e-6;
      default:
        return false;
    }
  }
}
