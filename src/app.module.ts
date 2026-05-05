import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthTokenModule } from './auth-token/auth-token.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, AuthTokenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
