import { Injectable } from '@nestjs/common';
import { CreatePermissoeDto } from './dto/create-permissoe.dto';
import { UpdatePermissoeDto } from './dto/update-permissoe.dto';

@Injectable()
export class PermissoesService {
  create(createPermissoeDto: CreatePermissoeDto) {
    return 'This action adds a new permissoe';
  }

  findAll() {
    return `This action returns all permissoes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permissoe`;
  }

  update(id: number, updatePermissoeDto: UpdatePermissoeDto) {
    return `This action updates a #${id} permissoe`;
  }

  remove(id: number) {
    return `This action removes a #${id} permissoe`;
  }
}
