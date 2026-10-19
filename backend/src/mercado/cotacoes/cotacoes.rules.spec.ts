import { ForbiddenException } from '@nestjs/common';
import { CotacoesServico } from './cotacoes.service';
import { CotacoesRepositorio } from './cotacoes.repository';
import { ProdutosRepositorio } from '../produtos/produtos.repository';
import { ContextoMercadoRepositorio } from '../shared/contexto-mercado.repository';
import { Produto } from '../produtos/entities/produto.entity';

describe('Cotações', () => {
  const cotacoes = new CotacoesServico(
    {} as CotacoesRepositorio,
    {} as ProdutosRepositorio,
    {} as ContextoMercadoRepositorio,
  );
  const produto = {
    id: 'produto',
    nome: 'Milho',
    unidade: 'kg',
    chave_estoque: 'cultura:milho',
    preco_base: 10,
    sensibilidade: 0.01,
    ativo: true,
  } satisfies Produto;

  it('reduz o preço conforme a quantidade vendida e aplica o piso', () => {
    expect(cotacoes.preco(produto, 0)).toBe(10);
    expect(cotacoes.preco(produto, 100)).toBe(5);
    expect(cotacoes.preco(produto, 1_000_000)).toBe(0.01);
  });

  it('usa os valores atualizados do produto na mesma temporada', () => {
    expect(
      cotacoes.preco({ ...produto, preco_base: 20, sensibilidade: 0.02 }, 100),
    ).toBe(6.67);
  });

  it('impede o aluno de consultar a cotação por outra fazenda', async () => {
    const repositorio = {
      buscarFazenda: () =>
        Promise.resolve({
          id: 'fazenda',
          usuario_id: 'outro-aluno',
          turma_id: 'turma',
          temporada_atual: 1,
        }),
    } as unknown as ContextoMercadoRepositorio;
    const servico = new CotacoesServico(
      {} as CotacoesRepositorio,
      {} as ProdutosRepositorio,
      repositorio,
    );

    await expect(
      servico.atual(
        { produto_id: 'produto', fazenda_id: 'fazenda' },
        { id: 'aluno', perfil: 'aluno', permissoes: [] },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
