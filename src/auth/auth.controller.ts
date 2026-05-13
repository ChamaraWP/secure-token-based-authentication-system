import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
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
  async login(
    @Body() input: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const results = await this.authService.login(input, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    res.cookie("refreshToken", results.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken as string;

    const results = await this.authService.refresh({ refreshToken });

    res.cookie("refreshToken", results.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      accessToken: results.accessToken,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout(
    @Body() body: LogoutDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const results = this.authService.logout(body, user);
    res.clearCookie("refreshToken", {
      path: "/auth/refresh",
    });
    return results;
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
