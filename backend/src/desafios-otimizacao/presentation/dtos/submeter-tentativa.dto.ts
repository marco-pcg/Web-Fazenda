import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmeterTentativaDto {
  @IsObject()
  @IsNotEmpty()
  valores: Record<string, number>; // Ex: { "x1": 25, "x2": 50 }
}
