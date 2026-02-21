import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import bodyParser, { json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ REQUEST LOGGER
  app.use((req: any, res: any, next: () => void) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
          res.statusCode
        } - ${duration}ms`,
      );
    });

    next();
  });

  app.use(
    json({
      verify: (req: any, res, buf, encoding) => {
        try {
          req.rawBody = buf;
        } catch (err) {
          throw new Error('Invalid body');
        }
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: '*', allowedHeaders: '*', methods: '*' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
