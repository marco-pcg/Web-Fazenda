import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos/produtos.controller';
import { CotacoesController } from './cotacoes/cotacoes.controller';
import { EstoqueController } from './estoque/estoque.controller';
import { OrdensController } from './ordens/ordens.controller';
import { TransacoesController } from './transacoes/transacoes.controller';
import { CooperativaController } from './cooperativa/cooperativa.controller';
import { ContextoMercadoRepository } from './shared/contexto-mercado.repository';
import { ProdutosRepository } from './produtos/produtos.repository';
import { CotacoesRepository } from './cotacoes/cotacoes.repository';
import { EstoqueRepository } from './estoque/estoque.repository';
import { OrdensRepository } from './ordens/ordens.repository';
import { TransacoesRepository } from './transacoes/transacoes.repository';
import { CooperativaRepository } from './cooperativa/cooperativa.repository';
import { EstoqueService } from './estoque/estoque.service';
import { CotacoesService } from './cotacoes/cotacoes.service';
import { ProdutosService } from './produtos/produtos.service';
import { OrdensService } from './ordens/ordens.service';
import { TransacoesService } from './transacoes/transacoes.service';
import { CooperativaService } from './cooperativa/cooperativa.service';

@Module({
  controllers: [
    ProdutosController,
    CotacoesController,
    EstoqueController,
    OrdensController,
    TransacoesController,
    CooperativaController,
  ],
  providers: [
    ContextoMercadoRepository,
    ProdutosRepository,
    CotacoesRepository,
    EstoqueRepository,
    OrdensRepository,
    TransacoesRepository,
    CooperativaRepository,
    EstoqueService,
    CotacoesService,
    ProdutosService,
    OrdensService,
    TransacoesService,
    CooperativaService,
  ],
  exports: [EstoqueService],
})
export class MercadoModule {}
