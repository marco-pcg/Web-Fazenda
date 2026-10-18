import { ApiProperty } from '@nestjs/swagger';

export class Plantio {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  talhao_id: string;
  @ApiProperty({ format: 'uuid' })
  cultura_id: string;
  @ApiProperty({ example: 2 })
  quantidade: number;
  @ApiProperty({ example: 2 })
  area_usada: number;
  @ApiProperty({ example: 2 })
  agua_usada: number;
  @ApiProperty({ example: 1 })
  temporada: number;
  @ApiProperty({ example: 'primavera' })
  estacao: string;
  @ApiProperty({ format: 'date' })
  data_plantio: string;
  @ApiProperty({ format: 'date' })
  data_prevista_colheita: string;
  @ApiProperty({ example: false })
  penalidade_rotacao: boolean;
  @ApiProperty({ example: 'em_crescimento', enum: ['em_crescimento', 'pronto', 'colhido'] })
  status: string;
  @ApiProperty({ format: 'date-time' })
  created_at: Date;
  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}
