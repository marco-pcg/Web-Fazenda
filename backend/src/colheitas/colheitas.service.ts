import { Injectable, NotFoundException } from '@nestjs/common';
import { ColheitasRepository } from './colheitas.repository';
import { FiltroColheitaDto } from './dto/filtro-colheita.dto';

@Injectable()
export class ColheitasService {
  constructor(private readonly colheitasRepository: ColheitasRepository) {}

  findAll(filtro: FiltroColheitaDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.colheitasRepository.findAll(filtro, limit, offset);
  }

  async findOne(id: number) {
    const colheita = await this.colheitasRepository.findOne(id);
    if (!colheita) {
      throw new NotFoundException('Colheita não encontrada.');
    }
    return colheita;
  }
}
