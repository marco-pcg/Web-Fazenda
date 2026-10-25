export function hoje() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return ano + '-' + mes + '-' + dia;
}

export function somarDias(data: string, dias: number) {
  const resultado = new Date(data);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

export function diasEntre(inicio: string, fim: string) {
  const umDia = 1000 * 60 * 60 * 24;
  return (new Date(fim).getTime() - new Date(inicio).getTime()) / umDia;
}
