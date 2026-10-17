import { IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FilterUsuarioDto extends PaginacaoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  perfil?: string;
}
