import { registerAs } from '@nestjs/config';

export type Config = {
  storageUrl: string;
  lineApiUrl: string;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  minio: {
    endPoint: string;
    port: number;
    useSSL: boolean;
    location: string;
    accessKey: string;
    secretKey: string;
  };
  email: {
    host: string;
    port: number;
    useSSL: boolean;
    username: string;
    password: string;
    defaultFrom: string;
  };
};

export default registerAs('config', () => {
  return {
    storageUrl: process.env.STORAGE_URL || '',
    lineApiUrl: process.env.LINE_API_URL || '',
    db: {
      host: process.env.DB_HOST || '',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || '',
      password: process.env.DB_PASS || '',
      name: process.env.DB_NAME || '',
    },
    minio: {
      endPoint: process.env.MINIO_END_POINT || '',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === '1',
      location: process.env.MINIO_LOCATION || '',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    },
    email: {
      host: process.env.EMAIL_HOST || '',
      port: Number(process.env.EMAIL_PORT) || 25,
      useSSL: process.env.EMAIL_USE_SSL === '1',
      username: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASS || '',
      defaultFrom: process.env.EMAIL_DEFAULT_FROM || '',
    },
  } as Config;
});
