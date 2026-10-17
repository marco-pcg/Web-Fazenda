import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Estoque {
  @ApiProperty({ format: 'uuid' })
  fazenda_id: string;

  @ApiProperty({ example: 0 })
  racao: string | number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  produtos: Record<string, number> | string;

  @ApiPropertyOptional({ format: 'date-time' })
  created_at?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  updated_at?: Date;
}
