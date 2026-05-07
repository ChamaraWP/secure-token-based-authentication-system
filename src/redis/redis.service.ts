import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS } from './redis.constants';
import type { RedisClient } from './redis.types';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS) readonly client: RedisClient) {}

  private async ensureConnection() {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  async get(key: string) {
    await this.ensureConnection();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    await this.ensureConnection();

    if (ttlSeconds !== undefined) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }

    return this.client.set(key, value);
  }

  async del(key: string) {
    await this.ensureConnection();
    return this.client.del(key);
  }

  async exists(key: string) {
    await this.ensureConnection();
    return this.client.exists(key);
  }

  async expire(key: string, ttlSeconds: number) {
    await this.ensureConnection();
    return this.client.expire(key, ttlSeconds);
  }

  async onModuleDestroy() {
    if (this.client.status === 'end' || this.client.status === 'wait') {
      return;
    }

    await this.client.quit();
  }
}
