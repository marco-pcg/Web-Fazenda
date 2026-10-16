import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'E-mail do usuário', example: 'user123@fazendinha.com' })
  @IsEmail({}, { message: 'O e-mail informado deve ser válido.' })
  email: string;

  @ApiProperty({ description: 'Senha de acesso', example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  senha: string;
}
