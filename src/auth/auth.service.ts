import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { verifyPassword } from '../common/utils/password';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from './auth.constants';
import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      input.email.toLocaleLowerCase().trim(),
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
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

    const accessToken = await this.generateAccessToken(user);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken: accessToken,
    };
  }

  async validateUserCredentials(input: { username: string; password: string }) {
    const user = await this.usersService.findByEmail(
      input.username.toLocaleLowerCase().trim(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
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
}
