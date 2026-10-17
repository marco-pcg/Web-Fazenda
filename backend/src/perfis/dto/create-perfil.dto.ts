import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerfilDto {
  @ApiProperty({ description: 'Nome identificador do perfil', example: 'coordenador' })
  @IsString({ message: 'O nome deve ser uma cadeia de caracteres.' })
  @IsNotEmpty({ message: 'O nome do perfil é obrigatório.' })
  nome: string;

  @ApiPropertyOptional({ default: true, description: 'Indica se o perfil está ativo' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser booleano.' })
  ativo?: boolean = true;
}
