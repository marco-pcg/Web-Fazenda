import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmeterTentativaDto {
  @IsObject()
  @IsNotEmpty()
  valores: Record<string, number>;
}
