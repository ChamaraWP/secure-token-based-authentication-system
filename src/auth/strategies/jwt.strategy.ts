import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT_ACCESS_SECRET, JWT_AUDIENCE, JWT_ISSUER } from "../auth.constants";
import type { JwtPayload } from "../types/jwt-payload.type";
import type { AuthenticatedUser } from "../types/authenticated-user.type";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ACCESS_SECRET,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
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
    };
  }
}
