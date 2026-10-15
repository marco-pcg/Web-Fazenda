import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrarProblemaDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nivel?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  publicado?: boolean;
}