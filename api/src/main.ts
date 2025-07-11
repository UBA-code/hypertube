import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(multipart as any, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });

  app.register(fastifyStatic as any, {
    root: join(process.cwd(), 'uploads'), // Path to the uploads folder
    prefix: '/uploads/', // URL prefix for accessing files
  });
  await app.register(fastifyCookie as any, {
    secret: 'my-secret', // for cookies signature
  });

  const config = new DocumentBuilder()
    .setTitle('Hypertube API')
    .setDescription('This is the API documentation for Hypertube.')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
