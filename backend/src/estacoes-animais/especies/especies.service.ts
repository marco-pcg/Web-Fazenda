import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EspeciesRepository } from './especies.repository';
import { Especie } from './especie.types';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';
import { QueryEspecieDto } from './dto/query-especie.dto';

@Injectable()
export class EspeciesService {
  constructor(private readonly especiesRepository: EspeciesRepository) {}

  async listar(filtros: QueryEspecieDto) {
    const resultado = await this.especiesRepository.listar(
      filtros,
      filtros.page,
      filtros.limit,
    );

    return {
      data: resultado.data.map((especie) => this.converterNumeros(especie)),
      meta: resultado.meta,
    };
  }

  async criar(createEspecieDto: CreateEspecieDto) {
    const nomeExiste = await this.especiesRepository.findByNome(
      createEspecieDto.nome,
    );
    if (nomeExiste) {
      throw new ConflictException(
        `Já existe uma espécie com o nome ${createEspecieDto.nome}.`,
      );
    }

    const especie = await this.especiesRepository.insert({
      ...createEspecieDto,
      ativo: createEspecieDto.ativo ?? true,
    });

    return this.converterNumeros(especie);
  }

  async atualizar(id: string, updateEspecieDto: UpdateEspecieDto) {
    const especie = await this.especiesRepository.findById(id);
    if (!especie) {
      throw new NotFoundException('Espécie não encontrada.');
    }

    if (Object.keys(updateEspecieDto).length === 0) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualizar.',
      );
    }

    if (updateEspecieDto.nome && updateEspecieDto.nome !== especie.nome) {
      const nomeExiste = await this.especiesRepository.findByNome(
        updateEspecieDto.nome,
      );
      if (nomeExiste && nomeExiste.id !== id) {
        throw new ConflictException(
          `Já existe uma espécie com o nome ${updateEspecieDto.nome}.`,
        );
      }
    }

    const atualizada = await this.especiesRepository.update(
      id,
      updateEspecieDto,
    );
    if (!atualizada) {
      throw new NotFoundException('Espécie não encontrada.');
    }

    return this.converterNumeros(atualizada);
  }

  private converterNumeros(especie: Especie): Especie {
    return {
      ...especie,
      consumo_racao_por_animal: Number(especie.consumo_racao_por_animal),
      producao_por_animal: Number(especie.producao_por_animal),
      preco_base: Number(especie.preco_base),
      taxa_crescimento: Number(especie.taxa_crescimento),
    };
  }
}
