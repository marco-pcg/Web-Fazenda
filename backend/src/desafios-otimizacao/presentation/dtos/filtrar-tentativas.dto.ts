import { IsOptional, IsString } from 'class-validator';

export class FiltrarTentativasDto {
  @IsOptional()
  @IsString()
  alunoId?: string;

  @IsOptional()
  @IsString()
  problemaId?: string;
}