import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const WAREHOUSES_BASE = '/api/warehouses';
const TRUCKS_BASE = '/api/trucks';

function expectErrorShape(body: any) {
  // Nest default shape: { statusCode, message, error }
  // Ако сте го променяли, коригирай тук.
  expect(body).toBeDefined();
  expect(body.statusCode).toBeDefined();
  expect(body.message).toBeDefined();
}

describe('E2E Error Responses (400/404 + edge cases)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // В теста гарантираме валидиране (ако DTO-тата ви са с class-validator)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/warehouses -> 400 when missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post(WAREHOUSES_BASE)
      .send({})
      .expect(400);

    expectErrorShape(res.body);
  });

  it('GET /api/warehouses/:id -> 404 for non-existent id', async () => {
    const nonExistentId = '99999999-9999-9999-9999-999999999999';

    const res = await request(app.getHttpServer())
      .get(`${WAREHOUSES_BASE}/${nonExistentId}`)
      .expect(404);

    expectErrorShape(res.body);
  });

  it('POST /api/warehouses -> duplicate code should return 409', async () => {
    // code трябва да е от enum: BG, NL, MAIN, MAIN2
    const body = {
      code: 'MAIN2',
      name: `Warehouse E2E ${Date.now()}`,
      country: 'BG',
    };

    // първото създаване трябва да е 200/201
    await request(app.getHttpServer())
      .post(WAREHOUSES_BASE)
      .send(body)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(
            `Expected 200/201, got ${r.status} with body: ${JSON.stringify(r.body)}`,
          );
        }
      });

    // второто със същия code трябва да е 409 (ConflictException)
    const res = await request(app.getHttpServer())
      .post(WAREHOUSES_BASE)
      .send(body)
      .expect(409);

    expectErrorShape(res.body);
  });

  it('POST /api/trucks -> 400 when invalid payload', async () => {
    // Този endpoint очаква CreateTruckDto: plate, capacityPallet, homeWarehouseId
    // Изпращаме невалиден payload -> очакваме 400
    const res = await request(app.getHttpServer())
      .post(TRUCKS_BASE)
      .send({ plate: 123 }) // грешен тип + липсва homeWarehouseId
      .expect(400);

    expectErrorShape(res.body);
  });

  it('GET /api/trucks/:id -> 404 for non-existent id', async () => {
    const nonExistentId = '99999999-9999-9999-9999-999999999999';

    const res = await request(app.getHttpServer())
      .get(`${TRUCKS_BASE}/${nonExistentId}`)
      .expect(404);

    expectErrorShape(res.body);
  });
});
