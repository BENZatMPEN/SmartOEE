import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as https from 'https';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

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
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCrtPath),
        }
      : {};

  const app = await NestFactory.create(AppModule, {
    cors: true,
    httpsOptions,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb' }));
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);
  app.use(compression());

  // redis
  // const client = createClient();
  // const subscriber = client.duplicate();
  // await subscriber.connect();
  //
  // await subscriber.subscribe('tag-reads', async (message) => {
  //   // const eventService = app.get<EventService>(EventService);
  //   const processorService = app.get<ProcessorService>(ProcessorService);
  //   const obj = JSON.parse(message) as TagReadDto[];
  //   eventService.emit('tag-reads', obj);
  //   await processorService.addTagReadQueue(obj);
  // });

  await app.listen(port);
}

bootstrap()
  .then(() => {
    console.log('App started');
  })
  .catch((reason) => {
    console.log(reason);
  });

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
