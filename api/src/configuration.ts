import { registerAs } from '@nestjs/config';

export type Config = {
  lineApiUrl: string;
  clientSecret: string;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
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
  const config: Config = {
    lineApiUrl: process.env.LINE_API_URL || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    db: {
      host: process.env.DB_HOST || '',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || '',
      password: process.env.DB_PASS || '',
      name: process.env.DB_NAME || '',
    },
    email: {
      host: process.env.EMAIL_HOST || '',
      port: Number(process.env.EMAIL_PORT) || 25,
      useSSL: process.env.EMAIL_USE_SSL === '1',
      username: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASS || '',
      defaultFrom: process.env.EMAIL_DEFAULT_FROM || '',
    },
  };

  return config;
});
