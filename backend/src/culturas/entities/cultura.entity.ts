import { ApiProperty } from '@nestjs/swagger';

export class Cultura {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ example: 'Milho' })
  nome: string;
  @ApiProperty({ example: ['primavera', 'verao'], type: [String] })
  estacoes: string[];
  @ApiProperty({ example: 1 })
  area_por_unidade: number;
  @ApiProperty({ example: 1 })
  agua_por_unidade: number;
  @ApiProperty({ example: 90 })
  dias_crescimento: number;
  @ApiProperty({ example: 120 })
  rendimento_por_unidade: number;
  @ApiProperty({ example: 10 })
  valor_por_unidade: number;
  @ApiProperty({ format: 'date-time' })
  created_at: Date;
  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}
