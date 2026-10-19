export interface ContribuicaoDistribuicao {
  id: string;
  quantidade: number;
}

export function calcularDistribuicao(
  valorBruto: number,
  contribuicoes: ContribuicaoDistribuicao[],
) {
  const totalQuantidade = contribuicoes.reduce(
    (soma, item) => soma + item.quantidade,
    0,
  );
  if (totalQuantidade <= 0) {
    throw new Error('A venda não possui contribuições.');
  }

  const brutoCentavos = Math.round(valorBruto * 100);
  const taxaCentavos = Math.round(brutoCentavos * 0.05);
  const liquidoCentavos = brutoCentavos - taxaCentavos;
  const parcelas = contribuicoes.map((item) => {
    const exato = (liquidoCentavos * item.quantidade) / totalQuantidade;
    return { id: item.id, centavos: Math.floor(exato), fracao: exato % 1 };
  });
  let restante =
    liquidoCentavos - parcelas.reduce((soma, item) => soma + item.centavos, 0);
  parcelas.sort((a, b) => b.fracao - a.fracao || a.id.localeCompare(b.id));
  for (const parcela of parcelas) {
    if (restante === 0) {
      break;
    }
    parcela.centavos += 1;
    restante -= 1;
  }

  return { brutoCentavos, taxaCentavos, liquidoCentavos, parcelas };
}
