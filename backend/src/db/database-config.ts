import * as dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config();

const DEFAULT_DB_PORT = 5432;

export function getDatabaseConfig(): Knex.Config {
  const port = Number(process.env.DB_PORT || DEFAULT_DB_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT deve ser um número inteiro entre 1 e 65535.');
  }

  return {
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
  };
}

export function validateRuntimeConfiguration(): void {
  const missing = ['DB_NAME', 'DB_USER', 'JWT_SECRET'].filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Configuração ausente: ${missing.join(', ')}. Defina essas variáveis no ambiente antes de iniciar a API.`,
    );
  }
}
