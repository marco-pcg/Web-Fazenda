import { IsOptional, IsString } from "class-validator";
import { PaginacaoDto } from "src/common/dtos/paginacao.dto";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

export class FilterUsuarioDto extends PaginacaoDto {
    @IsOptional()
    @IsString({ message: dtoErrors().isNotString() })
    nome?: string;

    @IsOptional()
    @IsString({ message: dtoErrors().isNotString() })
    perfil?: string;
}