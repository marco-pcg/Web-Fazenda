import { AvaliadorOtimizacaoService } from './avaliador-otimizacao.service';
import { ProblemaEntity, TipoObjetivo } from '../entities/problema.entity';
import { OperadorRestricao } from '../entities/restricao.entity';

describe('AvaliadorOtimizacaoService (Testes Unitários)', () => {
  let service: AvaliadorOtimizacaoService;

  beforeEach(() => {
    service = new AvaliadorOtimizacaoService();
  });

  const problemaMaximizacao: Partial<ProblemaEntity> = {
    tipo: TipoObjetivo.MAXIMIZACAO,
    valorOtimoZ: 100, // Z* = 100
    funcaoObjetivo: [
      { variavelId: 'x1', coeficiente: 10 },
      { variavelId: 'x2', coeficiente: 20 },
    ],
    restricoes: [
      {
        id: 'r1',
        problemaId: 'p1',
        descricao: 'Limite de área de plantio',
        coeficientes: [
          { variavelId: 'x1', coeficiente: 1 },
          { variavelId: 'x2', coeficiente: 1 },
        ],
        operador: OperadorRestricao.MENOR_IGUAL,
        limite: 10, // x1 + x2 <= 10
      },
    ],
  };

  it('deve retornar nota 0 e viavel=false se violar alguma restrição', () => {
    // Solução violando a restrição x1 + x2 <= 10 -> (8 + 5 = 13 > 10)
    const valoresAluno = { x1: 8, x2: 5 };

    const resultado = service.avaliarTentativa(problemaMaximizacao as ProblemaEntity, valoresAluno);

    expect(resultado.viavel).toBe(false);
    expect(resultado.nota).toBe(0);
    expect(resultado.zAluno).toBe(0);
  });

  it('deve calcular nota proporcional correta para Maximização quando a resposta for viável', () => {
    // Solução viável: x1 = 4, x2 = 3 (4 + 3 = 7 <= 10)
    // Z_aluno = (10 * 4) + (20 * 3) = 40 + 60 = 100
    // Como Z* = 100, nota esperada = (100 / 100) * 10 = 10.0
    const valoresAluno = { x1: 4, x2: 3 };

    const resultado = service.avaliarTentativa(problemaMaximizacao as ProblemaEntity, valoresAluno);

    expect(resultado.viavel).toBe(true);
    expect(resultado.zAluno).toBe(100);
    expect(resultado.nota).toBe(10);
  });

  it('deve calcular nota parcial para solução subótima em Maximização', () => {
    // Solução viável: x1 = 2, x2 = 2 -> Z = (10*2) + (20*2) = 60
    // Nota esperada = (60 / 100) * 10 = 6.0
    const valoresAluno = { x1: 2, x2: 2 };

    const resultado = service.avaliarTentativa(problemaMaximizacao as ProblemaEntity, valoresAluno);

    expect(resultado.viavel).toBe(true);
    expect(resultado.zAluno).toBe(60);
    expect(resultado.nota).toBe(6);
  });

  it('deve calcular nota inversamente proporcional para Minimização (Z* / Z)', () => {
    const problemaMinimizacao: Partial<ProblemaEntity> = {
      tipo: TipoObjetivo.MINIMIZACAO,
      valorOtimoZ: 50, // Z* = 50
      funcaoObjetivo: [{ variavelId: 'x1', coeficiente: 5 }],
      restricoes: [],
    };

    // Aluno obteve Z = 100 (Custo maior que o ótimo Z*=50)
    // Nota esperada = (50 / 100) * 10 = 5.0
    const valoresAluno = { x1: 20 };

    const resultado = service.avaliarTentativa(problemaMinimizacao as ProblemaEntity, valoresAluno);

    expect(resultado.viavel).toBe(true);
    expect(resultado.zAluno).toBe(100);
    expect(resultado.nota).toBe(5);
  });
});
