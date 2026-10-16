import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateCulturaDto {
  @ApiProperty({ description: 'Nome da cultura', example: 'Milho' })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Estações do plantio',
    example: ['primavera', 'verao'],
  })
  @IsArray()
  @IsIn(['primavera', 'verao', 'outono', 'inverno'], { each: true })
  estacoes: string[];

  @ApiProperty({ description: 'Canteiros por unidade', example: 1 })
  @IsInt()
  @Min(1)
  area_por_unidade: number;

  @ApiProperty({ description: 'Baldes de água por unidade', example: 1 })
  @IsInt()
  @Min(1)
  agua_por_unidade: number;

  @ApiProperty({ description: 'Dias para crescer', example: 90 })
  @IsInt()
  @Min(1)
  dias_crescimento: number;

  @ApiProperty({ description: 'Kg colhidos por unidade', example: 120 })
  @IsNumber()
  rendimento_por_unidade: number;

  @ApiProperty({ description: 'Lucro por unidade', example: 10 })
  @IsNumber()
  valor_por_unidade: number;
}
