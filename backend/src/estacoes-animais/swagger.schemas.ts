import { ApiProperty } from '@nestjs/swagger';
import {
  AlvoEvento,
  NomeEstacao,
  SaudeRebanho,
  StatusEvento,
  StatusTemporada,
  TipoEvento,
} from '../common/enums/enums';

export class PaginacaoMetaResponse {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class EstacaoResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: NomeEstacao, example: NomeEstacao.PRIMAVERA })
  nome: NomeEstacao;

  @ApiProperty({ example: 1 })
  ordem: number;

  @ApiProperty({ example: 1.1 })
  fator_produtividade: number;

  @ApiProperty({ example: 1 })
  fator_agua: number;
}

export class EstacoesPaginadasResponse {
  @ApiProperty({ type: [EstacaoResponse] })
  data: EstacaoResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}

export class EspecieResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Cabra' })
  nome: string;

  @ApiProperty({ example: 'leite' })
  produto: string;

  @ApiProperty({ example: 'litro' })
  unidade_produto: string;

  @ApiProperty({ example: 20 })
  consumo_racao_por_animal: number;

  @ApiProperty({ example: 90 })
  producao_por_animal: number;

  @ApiProperty({ example: 3.5 })
  preco_base: number;

  @ApiProperty({ example: 0.05 })
  taxa_crescimento: number;

  @ApiProperty({ example: true })
  ativo: boolean;
}

export class EspeciesPaginadasResponse {
  @ApiProperty({ type: [EspecieResponse] })
  data: EspecieResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}

export class TemporadaResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  turma_id: string;

  @ApiProperty({ format: 'uuid' })
  estacao_id: string;

  @ApiProperty({ example: 1 })
  numero: number;

  @ApiProperty({ example: 'Temporada 1' })
  nome: string;

  @ApiProperty({ enum: StatusTemporada, example: StatusTemporada.PLANEJADA })
  status: StatusTemporada;

  @ApiProperty({ nullable: true, format: 'date-time', type: String })
  data_inicio: Date | null;

  @ApiProperty({ nullable: true, format: 'date-time', type: String })
  data_fim: Date | null;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}

export class TemporadasPaginadasResponse {
  @ApiProperty({ type: [TemporadaResponse] })
  data: TemporadaResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}

export class TemporadaAvancoResponse {
  @ApiProperty({ format: 'uuid' })
  temporada_id: string;

  @ApiProperty({ enum: StatusTemporada, example: StatusTemporada.PROCESSANDO })
  status: StatusTemporada;

  @ApiProperty({ example: 'temporada-123' })
  job_id: string;
}

export class RebanhoResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  fazenda_id: string;

  @ApiProperty({ format: 'uuid' })
  especie_id: string;

  @ApiProperty({ example: 100 })
  quantidade: number;

  @ApiProperty({ enum: SaudeRebanho, example: SaudeRebanho.SAUDAVEL })
  saude: SaudeRebanho;

  @ApiProperty({ nullable: true, format: 'date-time', type: String })
  ultima_alimentacao_em: Date | null;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}

export class RebanhosPaginadosResponse {
  @ApiProperty({ type: [RebanhoResponse] })
  data: RebanhoResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}

export class AlimentacaoResponse {
  @ApiProperty({ format: 'uuid' })
  rebanho_id: string;

  @ApiProperty({ example: 12 })
  racao_necessaria: number;

  @ApiProperty({ example: 10 })
  racao_fornecida: number;

  @ApiProperty({ example: 0.8333 })
  proporcao_atendida: number;

  @ApiProperty({ enum: SaudeRebanho, example: SaudeRebanho.SUBNUTRIDO })
  saude: SaudeRebanho;
}

export class EventoClimaticoResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  temporada_id: string;

  @ApiProperty({ format: 'uuid' })
  turma_id: string;

  @ApiProperty({ enum: TipoEvento, example: TipoEvento.CHUVA_FORTE })
  tipo: TipoEvento;

  @ApiProperty({ enum: AlvoEvento, example: AlvoEvento.AGUA })
  alvo: AlvoEvento;

  @ApiProperty({ example: 1.5 })
  multiplicador: number;

  @ApiProperty({ nullable: true, example: 'Chuva intensa' })
  descricao: string | null;

  @ApiProperty({ enum: StatusEvento, example: StatusEvento.ATIVO })
  status: StatusEvento;

  @ApiProperty({ format: 'uuid' })
  criado_por: string;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}

export class EventosClimaticosPaginadosResponse {
  @ApiProperty({ type: [EventoClimaticoResponse] })
  data: EventoClimaticoResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}

export class ProducaoResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  rebanho_id: string;

  @ApiProperty({ format: 'uuid' })
  temporada_id: string;

  @ApiProperty({ example: 'leite' })
  produto: string;

  @ApiProperty({ example: 270 })
  quantidade: number;

  @ApiProperty({ example: 1.1 })
  fator_aplicado: number;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}

export class ProducoesPaginadasResponse {
  @ApiProperty({ type: [ProducaoResponse] })
  data: ProducaoResponse[];

  @ApiProperty({ type: PaginacaoMetaResponse })
  meta: PaginacaoMetaResponse;
}
