import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Milho' })
  @IsString({ message: dtoErrors().isNotString() })
  @IsNotEmpty({ message: dtoErrors().isEmpty() })
  nome: string;

  @ApiProperty({ example: 'kg' })
  @IsString({ message: dtoErrors().isNotString() })
  @IsNotEmpty({ message: dtoErrors().isEmpty() })
  unidade: string;

  @ApiProperty({
    example: 'cultura:eea2c902-498b-43c5-9c81-d140e6f66e4d',
    description: 'Nome do produto dentro do estoque das fazendas',
  })
  @IsString({ message: dtoErrors().isNotString() })
  @IsNotEmpty({ message: dtoErrors().isEmpty() })
  chaveEstoque: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01, { message: dtoErrors().belowTheMin() })
  precoBase: number;

  @ApiProperty({ example: 0.01, description: 'Quanto o preço cai por venda' })
  @IsNumber()
  @Min(0, { message: dtoErrors().belowTheMin() })
  sensibilidade: number;
}
