import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthTokenModule } from './auth-token/auth-token.module';
import { RedisModule } from './redis/redis.module';
import { AccessTokenDenyListServiceModule } from './access-token-deny-list-service/access-token-deny-list-service.module';

@Module({
  imports: [DatabaseModule, RedisModule, UsersModule, AuthModule, AuthTokenModule, AccessTokenDenyListServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
