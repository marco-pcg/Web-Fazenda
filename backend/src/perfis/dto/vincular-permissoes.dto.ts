import { IsArray, IsUUID } from 'class-validator';
import { dtoErrors } from 'src/common/errors-handler/dto-errors';

export class VincularPermissoesDto {
    @IsArray({ message: dtoErrors().isNotArray() })
    @IsUUID('all', { each: true, message: dtoErrors().isNotUUID() })
    permissoes: string[];
}