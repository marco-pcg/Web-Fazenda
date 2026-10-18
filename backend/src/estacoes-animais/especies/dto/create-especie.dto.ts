import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEspecieDto {
  @ApiProperty({ description: 'Nome da espécie', example: 'Cabra' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @Length(2, 60, { message: 'O nome deve ter entre 2 e 60 caracteres.' })
  nome: string;

  @ApiProperty({ description: 'Produto gerado pela espécie', example: 'leite' })
  @IsString({ message: 'O produto deve ser um texto.' })
  @IsNotEmpty({ message: 'O produto é obrigatório.' })
  produto: string;

  @ApiProperty({
    description: 'Unidade de medida do produto',
    example: 'litro',
  })
  @IsString({ message: 'A unidade do produto deve ser um texto.' })
  @IsNotEmpty({ message: 'A unidade do produto é obrigatória.' })
  unidade_produto: string;

  @ApiProperty({
    description: 'Quantidade de ração consumida por animal na temporada',
    example: 20,
  })
  @IsNumber({}, { message: 'O consumo de ração deve ser um número.' })
  @Min(0, { message: 'O consumo de ração não pode ser negativo.' })
  consumo_racao_por_animal: number;

  @ApiProperty({
    description: 'Quantidade de produto gerada por animal na temporada',
    example: 90,
  })
  @IsNumber({}, { message: 'A produção por animal deve ser um número.' })
  @Min(0, { message: 'A produção por animal não pode ser negativa.' })
  producao_por_animal: number;

  @ApiProperty({
    description: 'Preço base de uma unidade do produto',
    example: 3.5,
  })
  @IsNumber({}, { message: 'O preço base deve ser um número.' })
  @Min(0, { message: 'O preço base não pode ser negativo.' })
  preco_base: number;

  @ApiProperty({
    description: 'Taxa de crescimento do rebanho por temporada (0 a 1)',
    example: 0.05,
  })
  @IsNumber({}, { message: 'A taxa de crescimento deve ser um número.' })
  @Min(0, { message: 'A taxa de crescimento mínima é 0.' })
  @Max(1, { message: 'A taxa de crescimento máxima é 1.' })
  taxa_crescimento: number;

  @ApiPropertyOptional({
    description: 'Se a espécie está disponível',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
