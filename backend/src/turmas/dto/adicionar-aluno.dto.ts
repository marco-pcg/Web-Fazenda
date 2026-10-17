import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdicionarAlunoDto {
  @ApiProperty({
    description: 'ID do aluno (UUID) a ser matriculado na turma',
    example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  })
  @IsUUID('all', { message: 'O ID do aluno deve ser um UUID válido.' })
  aluno_id: string;
}
