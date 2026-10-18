import { BadRequestException } from '@nestjs/common';
import { database } from '../../db/knex-connection';
import { EstoqueAdapter } from './estoque.adapter';

jest.mock('../../db/knex-connection', () => ({ database: jest.fn() }));

const mockedDatabase = database as unknown as jest.Mock;

describe('EstoqueAdapter', () => {
  let adapter: EstoqueAdapter;

  beforeEach(() => {
    mockedDatabase.mockReset();
    (database as unknown as { fn: { now: jest.Mock } }).fn = {
      now: jest.fn().mockReturnValue('now()'),
    };
    adapter = new EstoqueAdapter();
  });

  it('retorna zero quando não existe estoque persistido', async () => {
    mockedDatabase.mockReturnValue({
      where: jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(undefined) }),
    });

    await expect(adapter.obterRacao('fazenda-1')).resolves.toBe(0);
  });

  it('consome ração persistida e rejeita consumo acima do saldo', async () => {
    const update = jest.fn().mockResolvedValue(1);
    const first = jest.fn().mockResolvedValue({
      fazenda_id: 'fazenda-1',
      racao: '12.5',
      produtos: {},
    });
    mockedDatabase.mockReturnValue({
      where: jest.fn().mockReturnValue({ first, update }),
      fn: { now: jest.fn().mockReturnValue('now()') },
    });

    await adapter.consumirRacao('fazenda-1', 2.5);
    expect(update).toHaveBeenCalledWith({ racao: 10, updated_at: 'now()' });

    await expect(adapter.consumirRacao('fazenda-1', 20)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('credita produto no estoque persistido', async () => {
    const update = jest.fn().mockResolvedValue(1);
    const first = jest.fn().mockResolvedValue({
      fazenda_id: 'fazenda-1',
      racao: '0',
      produtos: { ovos: 3 },
    });
    mockedDatabase.mockReturnValue({
      where: jest.fn().mockReturnValue({ first, update }),
      fn: { now: jest.fn().mockReturnValue('now()') },
    });

    await adapter.creditarProduto('fazenda-1', 'ovos', 2);
    expect(update).toHaveBeenCalledWith({
      produtos: { ovos: 5 },
      updated_at: 'now()',
    });
  });
});
