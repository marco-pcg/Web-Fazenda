import { IsString, IsNotEmpty, IsInt, IsUUID, Length, Min } from "class-validator";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

const valorMin = 1;

export class CreateTurmaDto {
    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    @Length(4, 4, { message: dtoErrors().outsideTheLength() })
    codigoTurma: string;

    @IsString({ message: dtoErrors().isNotString() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    nome: string;

    @IsInt({ message: dtoErrors().isNotInt() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    ano: number;

    @IsInt({ message: dtoErrors().isNotInt() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    @Min(valorMin, { message: dtoErrors().belowTheMin() })
    maxAlunos: number;

    @IsUUID('all', { message: dtoErrors().isNotUUID() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    idProfessor: string;
}
