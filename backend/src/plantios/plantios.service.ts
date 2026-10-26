import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { database } from '../db/knex-connection';
import { diasEntre, hoje, somarDias } from '../common/datas';
import { PlantiosRepository } from './plantios.repository';
import { TalhoesRepository } from '../talhoes/talhoes.repository';
import { FazendasRepository } from '../fazendas/fazendas.repository';
import { CulturasRepository } from '../culturas/culturas.repository';
import { ColheitasRepository } from '../colheitas/colheitas.repository';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { ColherPlantioDto } from './dto/colher-plantio.dto';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';
import {
  calcularAproveitamento,
  calcularPerda,
  duasCasas,
} from './plantios.regras';

@Injectable()
export class PlantiosService {
  constructor(
    private readonly plantiosRepository: PlantiosRepository,
    private readonly talhoesRepository: TalhoesRepository,
    private readonly fazendasRepository: FazendasRepository,
    private readonly culturasRepository: CulturasRepository,
    private readonly colheitasRepository: ColheitasRepository,
  ) {}

  async create(dados: CreatePlantioDto) {
    const talhao = await this.talhoesRepository.findOne(dados.talhaoId);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado.');
    }
    if (talhao.status === 'plantado') {
      throw new ConflictException('Esse talhão já está plantado.');
    }

    const cultura = await this.culturasRepository.findOne(dados.culturaId);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    const fazenda = await this.fazendasRepository.findOne(talhao.fazendaId);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    if (!cultura.estacoes.includes(fazenda.estacaoAtual)) {
      throw new UnprocessableEntityException(
        'Essa cultura não pode ser plantada nessa estação.',
      );
    }

    const areaUsada = dados.quantidade * cultura.areaPorUnidade;
    const aguaUsada = dados.quantidade * cultura.aguaPorUnidade;

    if (areaUsada > talhao.area) {
      throw new UnprocessableEntityException('Área insuficiente no talhão.');
    }
    if (aguaUsada > fazenda.aguaDisponivel) {
      throw new UnprocessableEntityException('Água insuficiente na fazenda.');
    }

    const plantioAnterior = await this.plantiosRepository.plantioNaTemporada(
      talhao.id,
      cultura.id,
      fazenda.temporadaAtual - 1,
    );
    const penalidadeRotacao = Boolean(plantioAnterior);
    let dataPlantio = hoje();
    if (dados.dataPlantio) {
      dataPlantio = dados.dataPlantio.slice(0, 10);
    }

    const plantio = await database.transaction(async (trx) => {
      const novo = await this.plantiosRepository.create(
        {
          talhaoId: talhao.id,
          culturaId: cultura.id,
          quantidade: dados.quantidade,
          areaUsada,
          aguaUsada,
          temporada: fazenda.temporadaAtual,
          estacao: fazenda.estacaoAtual,
          dataPlantio,
          dataPrevistaColheita: somarDias(dataPlantio, cultura.diasCrescimento),
          penalidadeRotacao,
        },
        trx,
      );

      await this.talhoesRepository.update(
        talhao.id,
        { status: 'plantado' },
        trx,
      );
      await this.fazendasRepository.update(
        fazenda.id,
        { aguaDisponivel: fazenda.aguaDisponivel - aguaUsada },
        trx,
      );

      return novo;
    });

    if (penalidadeRotacao) {
      return {
        ...plantio,
        aviso: 'Mesma cultura da temporada passada, o rendimento vai cair 20%.',
      };
    }
    return plantio;
  }

  findAll(filtro: FiltroPlantioDto) {
    return this.plantiosRepository.findAll(filtro);
  }

  async findOne(id: string) {
    const plantio = await this.plantiosRepository.findOne(id);
    if (!plantio) {
      throw new NotFoundException('Plantio não encontrado.');
    }
    return plantio;
  }

  async colher(id: string, dados: ColherPlantioDto) {
    const plantio = await this.findOne(id);
    if (plantio.status === 'colhido') {
      throw new ConflictException('Esse plantio já foi colhido.');
    }

    let dataColheita = hoje();
    if (dados.dataColheita) {
      dataColheita = dados.dataColheita.slice(0, 10);
    }
    if (dataColheita < plantio.dataPlantio) {
      throw new UnprocessableEntityException(
        'A data da colheita não pode ser antes do plantio.',
      );
    }

    const cultura = await this.culturasRepository.findOne(plantio.culturaId);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    const talhao = await this.talhoesRepository.findOne(plantio.talhaoId);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado.');
    }

    const diasPassados = diasEntre(plantio.dataPlantio, dataColheita);
    const antecipada = diasPassados < cultura.diasCrescimento;
    const perda = calcularPerda(diasPassados, cultura.diasCrescimento);
    const aproveitamento = calcularAproveitamento(
      perda,
      plantio.penalidadeRotacao,
    );

    return database.transaction(async (trx) => {
      const atualizados = await this.plantiosRepository.marcarColhido(id, trx);
      if (atualizados === 0) {
        throw new ConflictException('Esse plantio já foi colhido.');
      }

      const colheita = await this.colheitasRepository.create(
        {
          plantioId: plantio.id,
          dataColheita,
          antecipada,
          perdaPercentual: duasCasas(perda * 100),
          quantidadeColhida: duasCasas(
            plantio.quantidade * cultura.rendimentoPorUnidade * aproveitamento,
          ),
          valorEstimado: duasCasas(
            plantio.quantidade * cultura.valorPorUnidade * aproveitamento,
          ),
        },
        trx,
      );

      await this.talhoesRepository.update(
        plantio.talhaoId,
        { status: 'livre' },
        trx,
      );
      return colheita;
    });
  }
}
