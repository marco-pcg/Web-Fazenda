import { calcularDistribuicao } from './distribuicao';

describe('Distribuição da cooperativa', () => {
  it('retém cinco por cento e preserva cada centavo do valor líquido', () => {
    const resultado = calcularDistribuicao(100.01, [
      { id: 'a', quantidade: 1 },
      { id: 'b', quantidade: 1 },
      { id: 'c', quantidade: 1 },
    ]);

    expect(resultado.brutoCentavos).toBe(10001);
    expect(resultado.taxaCentavos).toBe(500);
    expect(resultado.liquidoCentavos).toBe(9501);
    expect(
      resultado.parcelas.reduce((soma, parcela) => soma + parcela.centavos, 0),
    ).toBe(9501);
    expect(resultado.parcelas.map((parcela) => parcela.centavos)).toEqual([
      3167, 3167, 3167,
    ]);
  });

  it('divide centavos restantes de forma determinística', () => {
    const resultado = calcularDistribuicao(0.05, [
      { id: 'b', quantidade: 1 },
      { id: 'a', quantidade: 1 },
      { id: 'c', quantidade: 1 },
    ]);

    expect(resultado.taxaCentavos).toBe(0);
    expect(
      resultado.parcelas.map((parcela) => [parcela.id, parcela.centavos]),
    ).toEqual([
      ['a', 2],
      ['b', 2],
      ['c', 1],
    ]);
  });
});
