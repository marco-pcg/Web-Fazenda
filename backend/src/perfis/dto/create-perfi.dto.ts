import { IsString, IsNotEmpty, IsOptional, IsBoolean, Validate } from "class-validator";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

export class CreatePerfiDto {
    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    nome: string;

    @IsString({ message: dtoErrors().isNotString() })
    @IsOptional()
    descricao?: string;

    @IsBoolean({ message: dtoErrors().isNotBoolean() })
    @IsOptional()
    ativo?: boolean;
}
