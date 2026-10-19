import { IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarProdutoDto {
  @ApiProperty({ example: 'Milho' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  nome: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  unidade: string;

  @ApiProperty({ example: 'cultura:eea2c902-498b-43c5-9c81-d140e6f66e4d' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  chave_estoque: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  preco_base: number;

  @ApiProperty({ example: 0.01 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  sensibilidade: number;
}
