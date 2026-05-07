import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AccessTokenDenylistService {
  constructor(private readonly redisService: RedisService) {}

  async denylist(jti: string, ttlSeconds: number) {
    await this.redisService.set(this.getKey(jti), "1", ttlSeconds);
  }

  async isDenylisted(jti: string): Promise<boolean> {
    const result = await this.redisService.exists(this.getKey(jti));
    return result === 1;
  }

  private getKey(jti: string): string {
    return `denylist:${jti}`;
  }
}
