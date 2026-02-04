import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Warehouses + Trucks (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Създава warehouse с първия свободен код.
   * Allowed codes: BG, NL, MAIN, MAIN2
   * Ако всички са заети → взима първия съществуващ.
   */
  async function createWarehouseWithFreeCode(suffix: number) {
    const server = app.getHttpServer();
    const codes = ['BG', 'NL', 'MAIN', 'MAIN2'];

    for (const code of codes) {
      const res = await request(server)
        .post('/api/warehouses')
        .send({
          code,
          name: `WH ${code} ${suffix}`,
          country: 'BG',
          address: 'Sofia',
        });

      if (res.status === 201) {
        return res.body;
      }
    }

    // fallback: взимаме вече съществуващ warehouse
    const list = await request(server)
      .get('/api/warehouses')
      .expect(200);

    if (!list.body?.length) {
      throw new Error('No warehouse could be created or found');
    }

    return list.body[0];
  }

  it('POST /api/warehouses -> 400 when code is invalid', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/warehouses')
      .send({
        code: 'INVALID',
        name: 'Invalid WH',
        country: 'BG',
      });

    expect(res.status).toBe(400);
  });

  it('happy path: create warehouse -> create truck -> list trucks contains it', async () => {
    const suffix = Date.now();

    const warehouse = await createWarehouseWithFreeCode(suffix);
    expect(warehouse.id).toBeTruthy();

    const truck = await request(app.getHttpServer())
      .post('/api/trucks')
      .send({
        plate: `CB${String(suffix).slice(-4)}AB`,
        capacityPallet: 24,
        homeWarehouseId: warehouse.id,
      })
      .expect(201);

    expect(truck.body.id).toBeTruthy();
    expect(truck.body.homeWarehouseId).toBe(warehouse.id);

    const list = await request(app.getHttpServer())
      .get('/api/trucks')
      .expect(200);

    expect(list.body.some((t: any) => t.id === truck.body.id)).toBe(true);
  });
});
