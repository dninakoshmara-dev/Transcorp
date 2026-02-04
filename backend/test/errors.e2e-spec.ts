import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('API e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/trips -> 200', async () => {
    await supertest(app.getHttpServer()).get('/api/trips').expect(200);
  });

  it('GET /api/trucks -> 200', async () => {
    await supertest(app.getHttpServer()).get('/api/trucks').expect(200);
  });

  it('GET /trucks -> 200 (legacy)', async () => {
    await supertest(app.getHttpServer()).get('/trucks').expect(200);
  });
});
