import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CulturasRepository } from './culturas.repository';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';
import { FiltroCulturaDto } from './dto/filtro-cultura.dto';

@Injectable()
export class CulturasService {
  constructor(private readonly culturasRepository: CulturasRepository) {}

  async create(createCulturaDto: CreateCulturaDto) {
    const existe = await this.culturasRepository.findByNome(
      createCulturaDto.nome,
    );
    if (existe) {
      throw new ConflictException('Já existe uma cultura com esse nome.');
    }

    return this.culturasRepository.create(createCulturaDto);
  }

  findAll(filtro: FiltroCulturaDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.culturasRepository.findAll(filtro, limit, offset);
  }

  async findOne(id: string) {
    const cultura = await this.culturasRepository.findOne(id);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada.');
    }
    return cultura;
  }

  async update(id: string, updateCulturaDto: UpdateCulturaDto) {
    await this.findOne(id);

    if (updateCulturaDto.nome) {
      const existe = await this.culturasRepository.findByNome(
        updateCulturaDto.nome,
      );
      if (existe && existe.id !== id) {
        throw new ConflictException('Já existe uma cultura com esse nome.');
      }
    }

    return this.culturasRepository.update(id, updateCulturaDto);
  }

  async remove(id: string) {
    await this.findOne(id);

    const foiPlantada = await this.culturasRepository.foiPlantada(id);
    if (foiPlantada) {
      throw new ConflictException(
        'Essa cultura já foi plantada e não pode ser excluída.',
      );
    }

    await this.culturasRepository.remove(id);
    return { mensagem: 'Cultura removida com sucesso.' };
  }
}
