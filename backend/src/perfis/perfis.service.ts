import { Injectable } from '@nestjs/common';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { UpdatePerfiDto } from './dto/update-perfi.dto';

@Injectable()
export class PerfisService {
  create(createPerfiDto: CreatePerfiDto) {
    return 'This action adds a new perfi';
  }

  findAll() {
    return `This action returns all perfis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} perfi`;
  }

  update(id: number, updatePerfiDto: UpdatePerfiDto) {
    return `This action updates a #${id} perfi`;
  }

  remove(id: number) {
    return `This action removes a #${id} perfi`;
  }
}
