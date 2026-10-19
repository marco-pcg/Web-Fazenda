import { Module } from '@nestjs/common';
import { ProdutosControlador } from './produtos/produtos.controller';
import { CotacoesControlador } from './cotacoes/cotacoes.controller';
import { EstoqueControlador } from './estoque/estoque.controller';
import { OrdensControlador } from './ordens/ordens.controller';
import { TransacoesControlador } from './transacoes/transacoes.controller';
import { CooperativaControlador } from './cooperativa/cooperativa.controller';
import { ContextoMercadoRepositorio } from './shared/contexto-mercado.repository';
import { ProdutosRepositorio } from './produtos/produtos.repository';
import { CotacoesRepositorio } from './cotacoes/cotacoes.repository';
import { EstoqueRepositorio } from './estoque/estoque.repository';
import { OrdensRepositorio } from './ordens/ordens.repository';
import { TransacoesRepositorio } from './transacoes/transacoes.repository';
import { CooperativaRepositorio } from './cooperativa/cooperativa.repository';
import { EstoqueServico } from './estoque/estoque.service';
import { CotacoesServico } from './cotacoes/cotacoes.service';
import { ProdutosServico } from './produtos/produtos.service';
import { OrdensServico } from './ordens/ordens.service';
import { TransacoesServico } from './transacoes/transacoes.service';
import { CooperativaServico } from './cooperativa/cooperativa.service';

@Module({
  controllers: [
    ProdutosControlador,
    CotacoesControlador,
    EstoqueControlador,
    OrdensControlador,
    TransacoesControlador,
    CooperativaControlador,
  ],
  providers: [
    ContextoMercadoRepositorio,
    ProdutosRepositorio,
    CotacoesRepositorio,
    EstoqueRepositorio,
    OrdensRepositorio,
    TransacoesRepositorio,
    CooperativaRepositorio,
    EstoqueServico,
    CotacoesServico,
    ProdutosServico,
    OrdensServico,
    TransacoesServico,
    CooperativaServico,
  ],
  exports: [EstoqueServico],
})
export class MercadoModulo {}
