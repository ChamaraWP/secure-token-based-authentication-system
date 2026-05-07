import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { AuthenticatedUser } from "./types/authenticated-user.type";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  @Post("register")
  register(@Body() input: RegisterDto) {
    return this.authService.register(input);
  }

  @Post("login")
  login(@Body() input: LoginDto, @Req() req: Request) {
    return this.authService.login(input, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });
  }

  @Post("refresh")
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout(@Body() body: LogoutDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(body, user);
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  logoutAll(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logoutAll(user.id);
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getActiveSessions(user.id);
  }

  @Delete("sessions/:familyId")
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("familyId") familyId: string,
  ) {
    return this.authService.revokeSession(user.id, familyId);
  }
}
