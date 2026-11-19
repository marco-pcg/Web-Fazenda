import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Queue } from 'bullmq';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { database } from '../src/db/knex-connection';
import { FILA_ESTACOES_ANIMAIS } from '../src/estacoes-animais/queue/queue.constants';
import { TemporadaAvancoProcessor } from '../src/estacoes-animais/queue/temporada-avanco.processor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await Promise.all([
      app.get<Queue>(getQueueToken(FILA_ESTACOES_ANIMAIS)).waitUntilReady(),
      app.get(TemporadaAvancoProcessor).worker.waitUntilReady(),
    ]);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app?.close();
  });

  afterAll(async () => {
    await database.destroy();
  });
});
