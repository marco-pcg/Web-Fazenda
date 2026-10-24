import { IsUUID, IsNotEmpty } from "class-validator";
import { dtoErrors } from "src/common/errors-handler/dto-errors";

export class AssociarAlunosDto {
    @IsUUID('all', { message: dtoErrors().isNotUUID() })
    @IsNotEmpty({ message: dtoErrors().isEmpty() })
    alunoId: string;
}