import { Injectable } from '@nestjs/common';
import { ProblemaEntity, TipoObjetivo } from '../entities/problema.entity';
import { RestricaoEntity, OperadorRestricao } from '../entities/restricao.entity';

@Injectable()
export class AvaliadorOtimizacaoService {
  avaliarTentativa(
    problema: ProblemaEntity,
    valoresAluno: Record<string, number>,
  ): { viavel: boolean; zAluno: number; nota: number } {

    const viavel = problema.restricoes.every((restricao: RestricaoEntity) =>
      this.validarRestricao(restricao, valoresAluno),
    )

    if (!viavel) {
      return { viavel: false, zAluno: 0, nota: 0 }
    }

    const zAluno = problema.funcaoObjetivo.reduce((acc, obj) => {
      const valorVariavel = valoresAluno[obj.variavelId] ?? 0
      return acc + obj.coeficiente * valorVariavel
    }, 0);

    const zOtimo = problema.valorOtimoZ
    let proporcao = 0

    if (problema.tipo === TipoObjetivo.MAXIMIZACAO) {
      proporcao = zOtimo !== 0 ? zAluno / zOtimo : 0
    } else {
      proporcao = zAluno !== 0 ? zOtimo / zAluno : 0
    }

    const nota = Math.min(Math.max(proporcao * 10, 0), 10)

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
      const val = valores[item.variavelId] ?? 0
      return acc + item.coeficiente * val
    }, 0);

    switch (restricao.operador) {
      case OperadorRestricao.MENOR_IGUAL:
        return lhs <= restricao.limite + 1e-6
      case OperadorRestricao.MAIOR_IGUAL:
        return lhs >= restricao.limite - 1e-6
      case OperadorRestricao.IGUAL:
        return Math.abs(lhs - restricao.limite) <= 1e-6
      default:
        return false
    }
  }
}
