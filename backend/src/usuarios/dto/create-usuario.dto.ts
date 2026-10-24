import { IsString, IsUUID, IsNotEmpty, IsOptional, IsEmail, MinLength, } from "class-validator";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

const minSize = 8;

export class CreateUsuarioDto {
    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    nome: string;

    @IsEmail({}, { message: dtoErrors().isNotEmail() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    email: string;

    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    @MinLength(minSize, { message: dtoErrors().belowTheMin() + " " + minSize })
    senha: string;

    @IsOptional()
    @IsUUID('all', { message: dtoErrors().isNotUUID() })
    perfilId?: string;

    @IsOptional()
    @IsUUID('all', { message: dtoErrors().isNotUUID() })
    turmaId?: string;
}


