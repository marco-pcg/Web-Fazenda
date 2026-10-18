import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTalhaoDto } from './create-talhao.dto';

export class UpdateTalhaoDto extends PartialType(
  OmitType(CreateTalhaoDto, ['fazenda_id']),
) {}
