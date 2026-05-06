import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { verifyPassword } from "../common/utils/password";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_AUDIENCE,
  JWT_ISSUER,
  REFRESH_TOKEN_EXPIRES_IN_DAYS,
} from "./auth.constants";
import type { JwtPayload } from "./types/jwt-payload.type";
import { AuthTokenService } from "../auth-token/auth-token.service";
import { generateOpaqueToken } from "../common/utils/token";
import { RefreshDto } from "./dto/refresh.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authTokenService: AuthTokenService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      input.email.toLocaleLowerCase().trim(),
    );
    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    const user = await this.usersService.createUser({
      email: input.email,
      password: input.password,
    });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(input: LoginDto) {
    const user = await this.validateUserCredentials({
      username: input.email,
      password: input.password,
    });

    const refreshToken = generateOpaqueToken();

    const accessToken = await this.generateAccessToken(user);

    await this.authTokenService.createRefreshToken({
      userId: user.id,
      rawToken: refreshToken,
      expiresAt: this.getRefreshTokenExpiryDate(),
    });

    return {
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async validateUserCredentials(input: { username: string; password: string }) {
    const user = await this.usersService.findByEmail(
      input.username.toLocaleLowerCase().trim(),
    );

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async refresh(input: RefreshDto) {
    const existingRefreshToken =
      await this.authTokenService.findRefreshTokenByRawToken(
        input.refreshToken,
      );

    if (!existingRefreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (existingRefreshToken.revoked) {
      await this.authTokenService.revokeRefreshTokensByFamily(
        existingRefreshToken.familyId,
      );

      throw new UnauthorizedException("Refresh token reuse detected");
    }

    if (existingRefreshToken.expiresAt < new Date()) {
      await this.authTokenService.revokeRefreshToken(existingRefreshToken.id);
      throw new UnauthorizedException("Refresh token has expired");
    }

    const user = await this.usersService.findById(existingRefreshToken.userId);

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = generateOpaqueToken();

    const newRefreshTokenRecord =
      await this.authTokenService.createRefreshToken({
        userId: user.id,
        rawToken: newRefreshToken,
        familyId: existingRefreshToken.familyId,
        expiresAt: this.getRefreshTokenExpiryDate(),
      });

    await this.authTokenService.revokeRefreshToken(
      existingRefreshToken.id,
      newRefreshTokenRecord.id,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async generateAccessToken(user: {
    id: string;
    email: string;
    tokenVersion: number;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tv: user.tokenVersion,
    };
    return this.jwtService.signAsync(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);
    return expiresAt;
  }
}
