import { AlvoEvento } from '../../common/enums/enums';
import { database } from '../../db/knex-connection';
import { FazendasAdapter } from './fazendas.adapter';

jest.mock('../../db/knex-connection', () => ({ database: jest.fn() }));

const mockedDatabase = database as unknown as jest.Mock;

describe('FazendasAdapter', () => {
  let adapter: FazendasAdapter;

  beforeEach(() => {
    mockedDatabase.mockReset();
    adapter = new FazendasAdapter();
  });

  it('lista fazendas persistidas pela turma', async () => {
    const where = jest.fn().mockResolvedValue([
      { id: 'fazenda-1', nome: 'Esperança', turma_id: 'turma-1', usuario_id: null },
    ]);
    mockedDatabase.mockReturnValue({ where });

    await expect(adapter.listarPorTurma('turma-1')).resolves.toEqual([
      {
        id: 'fazenda-1',
        nome: 'Esperança',
        turmaId: 'turma-1',
        usuarioId: null,
      },
    ]);
    expect(where).toHaveBeenCalledWith({ turma_id: 'turma-1' });
  });

  it('não fabrica fazenda nem concede posse', async () => {
    const first = jest.fn().mockResolvedValue(undefined);
    mockedDatabase.mockReturnValue({ where: jest.fn().mockReturnValue({ first }) });

    await expect(adapter.buscarPorId('inexistente')).resolves.toBeNull();
    await expect(adapter.pertenceAoUsuario('fazenda-1', 'usuario-1')).resolves.toBe(
      false,
    );
  });

  it('persiste o modificador e atualiza o fator da fazenda', async () => {
    const select = jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue([{ id: 'fazenda-1' }]),
    });
    const insert = jest.fn().mockReturnValue({
      onConflict: jest.fn().mockReturnValue({ ignore: jest.fn().mockResolvedValue([]) }),
    });
    const update = jest.fn().mockResolvedValue(1);
    const db = jest.fn((table: string) => {
      if (table === 'fazendas') {
        return { select, where: jest.fn().mockReturnValue({ update }) };
      }
      return { insert };
    });
    db.raw = jest.fn();

    await adapter.aplicarModificadorTurma('turma-1', {
      alvo: AlvoEvento.AGUA,
      multiplicador: 0.7,
      eventoId: 'evento-1',
    }, db as never);

    expect(insert).toHaveBeenCalledWith({
      fazenda_id: 'fazenda-1',
      evento_id: 'evento-1',
      alvo: AlvoEvento.AGUA,
      multiplicador: 0.7,
    });
    expect(update).toHaveBeenCalled();
  });
});
