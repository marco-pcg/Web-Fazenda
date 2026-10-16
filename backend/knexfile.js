require('dotenv').config();
const path = require('path');

const required = (name) => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Configuração ausente: ${name}. Defina essa variável antes de executar o Knex.`);
    }
    return value;
};

module.exports = {
    development: {
        client: process.env.DB_CLIENT || 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            database: required('DB_NAME'),
            user: required('DB_USER'),
            password: process.env.DB_PASSWORD,
        },
        migrations: {
            directory: process.env.DB_MIGRATIONS_DIR || path.resolve(__dirname, 'src/db/migrations'),
        },
        seeds: {
            directory: process.env.DB_SEEDS_DIR || path.resolve(__dirname, 'src/db/seeds'),
        },
    },
};