import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT_ACCESS_SECRET, JWT_AUDIENCE, JWT_ISSUER } from "../auth.constants";
import type { JwtPayload } from "../types/jwt-payload.type";
import type { AuthenticatedUser } from "../types/authenticated-user.type";
import { UsersService } from "../../users/users.service";
import { AccessTokenDenylistService } from "../../access-token-deny-list-service/access-token-deny-list.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly denylistService: AccessTokenDenylistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ACCESS_SECRET,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const isDenylisted = await this.denylistService.isDenylisted(payload.jti);

    if (isDenylisted) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }
    if (user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException("Token has been revoked");
    }
    return {
      id: user.id,
      email: user.email,
      jti: payload.jti,
    };
  }
}
