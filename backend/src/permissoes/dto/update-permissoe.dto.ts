import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissoeDto } from './create-permissoe.dto';

export class UpdatePermissoeDto extends PartialType(CreatePermissoeDto) {}
