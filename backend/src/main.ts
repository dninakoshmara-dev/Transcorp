import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
app.enableCors({
  origin: (origin, callback) => {
    // allow server-to-server / curl (no origin)
    if (!origin) return callback(null, true);

    const allowed =
      origin === 'http://localhost:3000' ||
      origin.endsWith('.onrender.com');

    return allowed
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}
bootstrap();
