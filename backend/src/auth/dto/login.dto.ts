import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

const minSize = 8;

export class LoginDto {
    @IsEmail({}, { message: dtoErrors().isNotEmail() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    email: string;

    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    @MinLength(minSize, { message: dtoErrors().belowTheMin() + " " + minSize })
    senha: string;
}