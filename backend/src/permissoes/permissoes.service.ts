import { Injectable } from '@nestjs/common';
import { PermissoesRepository } from './permissoes.repository';
import { FilterPermissoesDto } from './dto/filter-permissoes.dto';

@Injectable()
export class PermissoesService {
  constructor(private readonly repository: PermissoesRepository) { }

  async findAll(filter: FilterPermissoesDto) {
    const [permissoes] = await this.repository.findAll(filter);
    return permissoes;
  }
}
