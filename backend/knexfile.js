require('dotenv').config();

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
            directory: process.env.DB_MIGRATIONS_DIR,
        },
        seeds: {
            directory: process.env.DB_SEEDS_DIR,
        },
    },
};