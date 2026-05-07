import { Module } from "@nestjs/common";
import { AccessTokenDenylistService } from "./access-token-deny-list.service";

@Module({
  providers: [AccessTokenDenylistService],
  exports: [AccessTokenDenylistService],
})
export class AccessTokenDenyListServiceModule {}
