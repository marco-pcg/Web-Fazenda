export interface Especie {
  id: string;
  nome: string;
  produto: string;
  unidade_produto: string;
  consumo_racao_por_animal: number;
  producao_por_animal: number;
  preco_base: number;
  taxa_crescimento: number;
  ativo: boolean;
}
