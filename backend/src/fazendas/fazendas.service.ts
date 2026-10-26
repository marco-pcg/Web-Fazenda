import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FazendasRepository } from './fazendas.repository';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';
import { FiltroFazendaDto } from './dto/filtro-fazenda.dto';

@Injectable()
export class FazendasService {
  constructor(private readonly fazendasRepository: FazendasRepository) {}

  async create(dados: CreateFazendaDto) {
    await this.verificarTurmaEUsuario(dados);

    return this.fazendasRepository.create({
      ...dados,
      aguaDisponivel: dados.aguaTotal,
    });
  }

  findAll(filtro: FiltroFazendaDto) {
    return this.fazendasRepository.findAll(filtro);
  }

  async findOne(id: string) {
    const fazenda = await this.buscarFazenda(id);
    const talhoes = await this.fazendasRepository.findTalhoes(id);

    let areaTotal = 0;
    let areaLivre = 0;
    for (const talhao of talhoes) {
      areaTotal += talhao.area;
      if (talhao.status === 'livre') {
        areaLivre += talhao.area;
      }
    }

    return {
      ...fazenda,
      recursos: {
        areaTotal,
        areaLivre,
        aguaTotal: fazenda.aguaTotal,
        aguaDisponivel: fazenda.aguaDisponivel,
      },
      talhoes,
    };
  }

  async update(id: string, dados: UpdateFazendaDto) {
    const fazenda = await this.buscarFazenda(id);
    await this.verificarTurmaEUsuario(dados);

    let aguaDisponivel = fazenda.aguaDisponivel;

    if (dados.aguaTotal !== undefined) {
      const aguaGasta = fazenda.aguaTotal - fazenda.aguaDisponivel;

      if (dados.aguaTotal < aguaGasta) {
        throw new UnprocessableEntityException(
          'A água total não pode ser menor do que a água já usada.',
        );
      }

      aguaDisponivel = dados.aguaTotal - aguaGasta;
    }

    return this.fazendasRepository.update(id, { ...dados, aguaDisponivel });
  }

  async remove(id: string) {
    await this.buscarFazenda(id);

    const temPlantio = await this.fazendasRepository.temPlantio(id);
    if (temPlantio) {
      throw new ConflictException(
        'A fazenda tem histórico de plantios e não pode ser excluída.',
      );
    }

    await this.fazendasRepository.remove(id);
    return { mensagem: 'Fazenda removida com sucesso.' };
  }

  private async buscarFazenda(id: string) {
    const fazenda = await this.fazendasRepository.findOne(id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }
    return fazenda;
  }

  private async verificarTurmaEUsuario(dados: UpdateFazendaDto) {
    if (dados.turmaId) {
      const turma = await this.fazendasRepository.findTurma(dados.turmaId);
      if (!turma) {
        throw new NotFoundException('Turma não encontrada.');
      }
    }

    if (dados.usuarioId) {
      const usuario = await this.fazendasRepository.findUsuario(
        dados.usuarioId,
      );
      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }
  }
}
