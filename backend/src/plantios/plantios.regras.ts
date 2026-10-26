export function calcularPerda(diasPassados: number, diasCrescimento: number) {
  if (diasPassados >= diasCrescimento) {
    return 0;
  }
  if (diasPassados < diasCrescimento / 2) {
    return 1;
  }
  return 1 - diasPassados / diasCrescimento;
}

export function calcularAproveitamento(
  perda: number,
  penalidadeRotacao: boolean,
) {
  const aproveitamento = 1 - perda;
  return penalidadeRotacao ? aproveitamento * 0.8 : aproveitamento;
}

export function duasCasas(valor: number) {
  return Number(valor.toFixed(2));
}
