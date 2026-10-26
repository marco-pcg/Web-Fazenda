import { Injectable, NotFoundException } from '@nestjs/common';
import { ColheitasRepository } from './colheitas.repository';
import { FiltroColheitaDto } from './dto/filtro-colheita.dto';

@Injectable()
export class ColheitasService {
  constructor(private readonly colheitasRepository: ColheitasRepository) {}

  findAll(filtro: FiltroColheitaDto) {
    return this.colheitasRepository.findAll(filtro);
  }

  async findOne(id: string) {
    const colheita = await this.colheitasRepository.findOne(id);
    if (!colheita) {
      throw new NotFoundException('Colheita não encontrada.');
    }
    return colheita;
  }
}
