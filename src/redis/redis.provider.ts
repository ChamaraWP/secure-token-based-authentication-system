import Redis from 'ioredis';
import { REDIS } from './redis.constants';

const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DB = 0;

export const redisProviders = [
  {
    provide: REDIS,
    useFactory: () => {
      return new Redis({
        host: process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? DEFAULT_REDIS_PORT),
        db: Number(process.env.REDIS_DB ?? DEFAULT_REDIS_DB),
        password: process.env.REDIS_PASSWORD || undefined,
        keyPrefix: process.env.REDIS_KEY_PREFIX || undefined,
        lazyConnect: true,
      });
    },
  },
];
