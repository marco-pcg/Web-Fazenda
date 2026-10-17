import knex, { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

export const database: Knex = knex({
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 10,
    },
});

export default database;
