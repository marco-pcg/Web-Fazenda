import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { dtoErrors } from "../errors-handler/dto-errors";

const valorMin = 1;

export class PaginacaoDto {
    @IsOptional()
    @IsInt({ message: dtoErrors().isNotInt() })
    @Type(() => Number)
    @Min(valorMin, { message: dtoErrors().belowTheMin() + " " + valorMin })
    pagina?: number = 1;

    @IsOptional()
    @IsInt({ message: dtoErrors().isNotInt() })
    @Type(() => Number)
    @Min(valorMin, { message: dtoErrors().belowTheMin() + " " + valorMin })
    limite?: number = 10;

    @IsOptional()
    @IsString({ message: dtoErrors().isNotString() })
    search?: string;
}