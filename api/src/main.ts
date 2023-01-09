import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as https from 'https';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { EntityNotFoundExceptionFilter } from './common/filters/entity-not-found-exception.filter';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const sslCrtPath = process.env.SSL_CRT_PATH;
  const sslKeyPath = process.env.SSL_KEY_PATH;
  const sslRootCaPath = process.env.SSL_ROOT_CA_PATH;

  if (sslRootCaPath) {
    https.globalAgent.options.ca = fs.readFileSync(sslRootCaPath);
  }

  const httpsOptions =
    sslKeyPath && sslKeyPath
      ? {
          httpsOptions: {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCrtPath),
          },
        }
      : {};

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    ...httpsOptions,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb' }));
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.use(compression());
  // app.useGlobalFilters(new EntityNotFoundExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
}

bootstrap()
  .then(() => {
    console.log('App started');
  })
  .catch((reason) => {
    console.log(reason);
  });
