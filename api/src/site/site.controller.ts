import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteEntity } from '../common/entities/site-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { OptionItem } from '../common/type/option-item';
import { ReqAuthUser } from '../common/decorators/auth-user.decorator';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('user-sites')
  async findUserOptions(@ReqAuthUser() authUser: AuthUserDto): Promise<SiteEntity[]> {
    if (authUser.isAdmin) {
      return this.siteService.findAll();
    }

    return this.siteService.findUserSites(authUser.id);
  }

  // @Get('all')
  // async findAllSites(): Promise<SiteEntity[]> {
  //   return this.siteService.findAll();
  // }

  @Get('options')
  findAllOee(): Promise<OptionItem[]> {
    return this.siteService.findOptions();
  }

  @Get()
  findFilter(@Query() filterDto: FilterSiteDto): Promise<PagedLisDto<SiteEntity>> {
    return this.siteService.findPagedList(filterDto);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<SiteEntity> {
    return this.siteService.findById(id);
  }

  @Get(':id/devices')
  findDevicesById(@Param('id') id: number): Promise<SiteEntity> {
    return this.siteService.findDevicesById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createDto: CreateSiteDto, @UploadedFile(FileSavePipe) image: string): Promise<any> {
    return this.siteService.create(createDto, image);
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

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.siteService.delete(id);
  }

  @Delete()
  async deleteMany(@Query('ids', new ParseArrayPipe({ items: Number })) ids: number[]): Promise<void> {
    await this.siteService.deleteMany(ids);
  }

  @Put(':id/synced')
  async updateSync(@Param('id') id: number): Promise<void> {
    await this.siteService.updateSynced(id);
  }
}
