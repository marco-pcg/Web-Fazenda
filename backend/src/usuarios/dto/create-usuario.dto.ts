import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nome do usuário', example: 'Professor Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'professor@fazendinha.com',
  })
  @IsEmail({}, { message: 'O e-mail deve ser válido.' })
  email: string;

  @ApiProperty({ description: 'Senha de acesso', example: 'senha1234' })
  @IsString()
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  senha: string;

  @ApiPropertyOptional({
    description: 'ID do perfil associado',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID('all', { message: 'O perfil_id deve ser um UUID válido.' })
  perfil_id?: string;

  @ApiPropertyOptional({
    description: 'ID da turma vinculada (caso seja aluno)',
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  })
  @IsOptional()
  @IsUUID('all', { message: 'O turma_id deve ser um UUID válido.' })
  turma_id?: string;
}
