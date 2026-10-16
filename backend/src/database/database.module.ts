import { Global, Module } from '@nestjs/common';
import knex from 'knex';
import { KNEX } from './database.constants.js';
import config from './knexfile.js';

@Global()
@Module({
  providers: [
    {
      provide: KNEX,
      useFactory: () => knex(config),
    },
  ],
  exports: [KNEX],
})
export class DatabaseModule {}
