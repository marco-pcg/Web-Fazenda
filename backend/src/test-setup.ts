jest.mock('./db/knex-connection', () => ({
  database: jest.fn(),
}));
