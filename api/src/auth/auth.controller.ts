import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { TokenDto } from './dto/token.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { RoleEntity } from '../common/entities/role-entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): Promise<TokenDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async getProfile(@Request() req): Promise<AuthUserDto> {
    return req.user as AuthUserDto;
  }

  @UseGuards(JwtAuthGuard)
  @Get('role')
  getRole(@Request() req, @Query('siteId') siteId: string): Promise<RoleEntity> {
    const user = req.user as AuthUserDto;
    return this.authService.findRoleByUserIdAndSiteId(user.id, Number(siteId));
  }
}
