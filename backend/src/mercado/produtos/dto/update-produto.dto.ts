import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';
import { CreateProdutoDto } from './create-produto.dto';

export class UpdateProdutoDto extends PartialType(
  OmitType(CreateProdutoDto, ['chaveEstoque']),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: dtoErrors().isNotBoolean() })
  ativo?: boolean;
}
