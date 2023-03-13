import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { TokenDto } from './dto/token.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { ReqAuthUser } from '../common/decorators/auth-user.decorator';
import { UserEntity } from '../common/entities/user.entity';
import { InjectParamIdTo } from '../common/decorators/request-interceptor.dectorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/auth')
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
  @Get('user-profile')
  getUserInfo(@ReqAuthUser() authUser: AuthUserDto, @Query('siteId') siteId: number): Promise<UserEntity> {
    return this.authService.findByIdAndSiteId(authUser.id, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @InjectParamIdTo('body')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @ReqAuthUser() authUser: AuthUserDto,
    @Body() updateDto: UpdateProfileDto,
    @UploadedFile(FileSavePipe) image: string,
  ): Promise<UserEntity> {
    const user = await this.authService.findByEmail(updateDto.email);
    if (user.id !== authUser.id && user) {
      throw new BadRequestException(['Email already exists']);
    }

    return this.authService.updateProfile(authUser.id, updateDto, image);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @ReqAuthUser() authUser: AuthUserDto,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(authUser.id, changePasswordDto);
  }
}
