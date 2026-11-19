import { calcularAproveitamento, duasCasas } from '../plantios/plantios.regras';

export interface CulturaCandidata {
  id: string;
  nome: string;
  areaPorUnidade: number;
  aguaPorUnidade: number;
  valorPorUnidade: number;
  penalidadeRotacao: boolean;
}

export interface RecomendacaoPlantio {
  culturaId: string;
  culturaNome: string;
  quantidade: number;
  areaUsada: number;
  aguaUsada: number;
  valorEstimado: number;
  penalidadeRotacao: boolean;
}

export function recomendarPlantio(
  area: number,
  agua: number,
  culturas: CulturaCandidata[],
): RecomendacaoPlantio | null {
  let melhor: RecomendacaoPlantio | null = null;

  for (const cultura of culturas) {
    const {
      areaPorUnidade,
      aguaPorUnidade,
      penalidadeRotacao,
      valorPorUnidade,
    } = cultura;
    if (
      areaPorUnidade <= 0 ||
      aguaPorUnidade < 0 ||
      !Number.isFinite(valorPorUnidade)
    ) {
      continue;
    }

    const limiteArea = Math.floor(area / areaPorUnidade);
    const limiteAgua =
      aguaPorUnidade === 0 ? limiteArea : Math.floor(agua / aguaPorUnidade);
    const limite = Math.min(limiteArea, limiteAgua);
    if (limite < 1) {
      continue;
    }

    const quantidade = valorPorUnidade > 0 ? limite : 1;
    const candidata: RecomendacaoPlantio = {
      culturaId: cultura.id,
      culturaNome: cultura.nome,
      quantidade,
      areaUsada: quantidade * areaPorUnidade,
      aguaUsada: quantidade * aguaPorUnidade,
      valorEstimado: duasCasas(
        quantidade *
          valorPorUnidade *
          calcularAproveitamento(0, penalidadeRotacao),
      ),
      penalidadeRotacao,
    };

    if (
      !melhor ||
      candidata.valorEstimado > melhor.valorEstimado ||
      (candidata.valorEstimado === melhor.valorEstimado &&
        candidata.aguaUsada < melhor.aguaUsada)
    ) {
      melhor = candidata;
    }
  }

  return melhor;
}
