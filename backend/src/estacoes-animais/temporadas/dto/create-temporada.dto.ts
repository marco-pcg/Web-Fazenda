import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemporadaDto {
  @ApiProperty({
    description: 'ID da turma (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('all', { message: 'O turma_id deve ser um UUID válido.' })
  turma_id: string;

  @ApiProperty({
    description: 'ID da estação (UUID)',
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  })
  @IsUUID('all', { message: 'O estacao_id deve ser um UUID válido.' })
  estacao_id: string;

  @ApiProperty({ description: 'Nome da temporada', example: 'Temporada 1' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @Length(2, 80, { message: 'O nome deve ter entre 2 e 80 caracteres.' })
  nome: string;

  @ApiPropertyOptional({
    description: 'Data de início prevista',
    example: '2026-10-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de início deve ser uma data válida.' })
  data_inicio?: string;

  @ApiPropertyOptional({
    description: 'Data de fim prevista',
    example: '2026-12-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de fim deve ser uma data válida.' })
  data_fim?: string;
}
