// main.ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as FastifyFormBody from 'fastify-formbody';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false },
  );
  app.register(FastifyFormBody as any);
  await app.init();
  app.enableCors();
  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}
bootstrap();
