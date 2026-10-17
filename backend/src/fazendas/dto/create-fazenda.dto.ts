import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFazendaDto {
  @ApiProperty({ description: 'Nome da fazenda', example: 'Fazenda Esperança' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({
    description: 'Turma',
    example: 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5',
  })
  @IsOptional()
  @IsUUID()
  turma_id?: string;

  @ApiPropertyOptional({
    description: 'Aluno dono da fazenda',
    example: '087bfe24-cdeb-4e99-a2e8-a11d968bb17c',
  })
  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @ApiProperty({ description: 'Baldes de água', example: 14 })
  @IsInt()
  @Min(1)
  agua_total: number;

  @ApiProperty({ description: 'Estação atual', example: 'primavera' })
  @IsIn(['primavera', 'verao', 'outono', 'inverno'])
  estacao_atual: string;
}
