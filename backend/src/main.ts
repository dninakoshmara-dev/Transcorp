import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow server-to-server / curl (no origin header)
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

  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}

bootstrap();
