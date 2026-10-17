import { IsString, IsInt, IsUUID, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTurmaDto {
  @ApiProperty({
    description: 'Código único da turma (4 caracteres)',
    example: '3A01',
  })
  @IsString()
  @Length(4, 4, {
    message: 'O código da turma deve ter exatamente 4 caracteres.',
  })
  codigo: string;

  @ApiProperty({
    description: 'Nome descritivo da turma',
    example: '3º Ano A - Agropecuária',
  })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Ano letivo da turma', example: 2026 })
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  ano: number;

  @ApiProperty({
    description: 'Capacidade máxima de alunos na turma',
    example: 40,
    default: 40,
  })
  @IsInt({ message: 'A capacidade máxima deve ser um número inteiro.' })
  @Min(1, { message: 'A turma precisa ter espaço para pelo menos 1 aluno.' })
  max_alunos: number;

  @ApiProperty({
    description: 'ID do professor responsável (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('all', { message: 'O ID do professor deve ser um UUID válido.' })
  professor_id: string;
}
