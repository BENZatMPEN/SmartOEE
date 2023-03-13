import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SiteService } from './site.service';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteEntity } from '../common/entities/site.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { ReqAuthUser } from '../common/decorators/auth-user.decorator';
import { OptionItem } from '../common/type/option-item';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('user-sites')
  async findUserOptions(@ReqAuthUser() authUser: AuthUserDto): Promise<SiteEntity[]> {
    return this.siteService.findUserSites(authUser.id);
  }

  @Get('options')
  findOptions(@ReqAuthUser() authUser: AuthUserDto): Promise<OptionItem[]> {
    return this.siteService.findOptions(authUser.id);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<SiteEntity> {
    return this.siteService.findById(id);
  }

  @Get(':id/devices')
  findDevicesById(@Param('id') id: number): Promise<SiteEntity> {
    return this.siteService.findDevicesById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateSiteDto,
    @UploadedFile(FileSavePipe) image: string,
  ): Promise<SiteEntity> {
    return this.siteService.update(id, updateDto, image);
  }

  @Put(':id/synced')
  async updateSync(@Param('id') id: number): Promise<void> {
    await this.siteService.updateSynced(id);
  }
}
