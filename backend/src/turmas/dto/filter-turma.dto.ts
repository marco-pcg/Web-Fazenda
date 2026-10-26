import { IsOptional, IsInt, IsString } from "class-validator";

export class FilterTurmasDto {
    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsInt()
    ano?: number;
}