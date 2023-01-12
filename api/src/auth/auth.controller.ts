import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { TokenDto } from './dto/token.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { RoleEntity } from '../common/entities/role-entity';
import { ReqAuthUser } from '../common/decorators/auth-user.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): Promise<TokenDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  getProfile(@ReqAuthUser() authUser: AuthUserDto): AuthUserDto {
    return authUser;
  }

  @UseGuards(JwtAuthGuard)
  @Get('role')
  getRole(@ReqAuthUser() authUser: AuthUserDto, @Query('siteId') siteId: number): Promise<RoleEntity> {
    return this.authService.findRoleByUserIdAndSiteId(authUser.id, siteId);
  }
}
