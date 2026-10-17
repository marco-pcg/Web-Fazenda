import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CriarProdutoDto } from './criar-produto.dto';

export class EditarProdutoDto extends PartialType(
  OmitType(CriarProdutoDto, ['chave_estoque'] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
