import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendaConjunta {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  produto_id: string;

  @ApiProperty({ format: 'uuid' })
  turma_id: string;

  @ApiProperty({ format: 'uuid' })
  criador_usuario_id: string;

  @ApiProperty({ example: 1 })
  temporada: number;

  @ApiProperty({ example: 'ABERTA' })
  status: string;

  @ApiPropertyOptional({ nullable: true })
  valor_bruto: string | number | null;

  @ApiPropertyOptional({ nullable: true })
  taxa?: string | number | null;

  @ApiPropertyOptional({ nullable: true })
  valor_liquido?: string | number | null;

  @ApiPropertyOptional({ format: 'date-time' })
  created_at?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  updated_at?: Date;
}
