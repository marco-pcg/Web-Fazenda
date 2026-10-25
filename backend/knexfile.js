const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
    development: {
        client: process.env.DB_CLIENT,
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
        migrations: {
            directory: path.resolve(__dirname, process.env.DB_MIGRATION_DIR),
        },
        seeds: {
            directory: path.resolve(__dirname, process.env.DB_SEED_DIR),
        },
    },
};