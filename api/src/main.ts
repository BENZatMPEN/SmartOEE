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
import { defaultPercentSettings, initialRoles } from './common/constant';
import { AdminSiteService } from './admin-site/admin-site.service';
import { AdminUserService } from './admin-user/admin-user.service';
import { UserService } from './user/user.service';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const uploadFileSize = Number(process.env.UPLOAD_FILE_SIZE ?? 10);
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

  app.use(bodyParser.json({ limit: `${uploadFileSize}mb` }));
  app.use(bodyParser.urlencoded({ limit: `${uploadFileSize}mb` }));
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

  await seedInitialData(app);

  await app.listen(port);
}

async function seedInitialData(app: NestExpressApplication) {
  const adminSiteService = app.get(AdminSiteService);
  const adminUserService = app.get(AdminUserService);
  const userService = app.get(UserService);

  const existingSite = await adminSiteService.findById(1);
  if (existingSite) {
    return;
  }

  const site = await adminSiteService.create(
    {
      name: 'Main Site',
      remark: '',
      branch: '',
      address: '',
      lng: 0,
      lat: 0,
      active: false,
      sync: false,
      defaultPercentSettings: defaultPercentSettings,
      oeeLimit: -1,
      userLimit: -1,
      cutoffTime: new Date(),
    },
    null,
  );

  // Super admin
  await adminUserService.create(
    {
      email: 'superadmin@user.com',
      password: 'P@ssword1',
      firstName: 'Super',
      lastName: 'Admin',
      isAdmin: true,
      siteIds: [],
    },
    null,
  );

  const pollerRole = await this.roleService.create(
    {
      name: 'Poller',
      remark: '',
      roles: initialRoles,
    },
    site.id,
  );

  // For poller
  await userService.create(
    {
      email: 'poller@user.com',
      password: 'P@ssword1',
      firstName: 'Poller',
      lastName: 'User',
      siteIds: [site.id],
      roleId: pollerRole.id,
    },
    null,
    site.id,
  );
}

bootstrap()
  .then(() => {
    console.log('App started');
  })
  .catch((reason) => {
    console.log(reason);
  });
