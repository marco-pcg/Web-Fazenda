import knex, { Knex } from 'knex';
import { getDatabaseConfig } from './database-config';

export const database: Knex = knex(getDatabaseConfig());

export default database;
