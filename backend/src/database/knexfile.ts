import type { Knex } from 'knex';
import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  console.log('Arquivo .env não encontrado, usando valores padrão');
}

pg.types.setTypeParser(1700, (valor) => parseFloat(valor));

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USER || 'fazenda',
    password: process.env.DATABASE_PASSWORD || 'fazenda',
    database: process.env.DATABASE_NAME || 'fazenda',
  },
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

export default config;
