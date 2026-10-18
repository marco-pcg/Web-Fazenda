import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRebanhoDto {
  @ApiProperty({
    description: 'ID da fazenda (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('all', { message: 'O fazenda_id deve ser um UUID válido.' })
  fazenda_id: string;

  @ApiProperty({
    description: 'ID da espécie (UUID)',
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  })
  @IsUUID('all', { message: 'O especie_id deve ser um UUID válido.' })
  especie_id: string;

  @ApiProperty({ description: 'Quantidade de animais', example: 100 })
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade mínima é 1.' })
  quantidade: number;
}
