import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { FilterSiteDto } from './dto/filter-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from '../common/entities/site';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUserDto } from '../auth/dto/auth-user.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  findFilter(@Query() filterDto: FilterSiteDto): Promise<PagedLisDto<Site>> {
    return this.siteService.findPagedList(filterDto);
  }

  @Get('all')
  async findAll(@Request() req): Promise<Site[]> {
    const authUser = req.user as AuthUserDto;
    if (!authUser) {
      return [];
    }

    //
    // const hasOwnerRole = authUser.roles.findIndex((role) => role.name === ROLE_OWNER) >= 0;
    // if (hasOwnerRole) {
    //   return this.siteService.findAll();
    // }

    return this.siteService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Site> {
    const site = await this.siteService.findById(id);
    if (!site) {
      throw new NotFoundException();
    }

    return site;
  }

  @Get(':id/devices')
  findDevicesById(@Param('id') id: number): Promise<Site> {
    return this.siteService.findDevicesById(id);
  }

  @Post()
  create(@Body() createDto: CreateSiteDto): Promise<Site> {
    return this.siteService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateSiteDto): Promise<Site> {
    return this.siteService.update(id, updateDto);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  upload(@Param('id') id: number, @UploadedFile() image: Express.Multer.File): Promise<Site> {
    return this.siteService.upload(id, image);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.siteService.delete(id);
  }

  @Delete()
  async deleteMany(@Query() dto: IdListDto): Promise<void> {
    await this.siteService.deleteMany(dto.ids);
  }

  @Put(':id/synced')
  async updateSync(@Param('id') id: number): Promise<void> {
    await this.siteService.updateSynced(id);
  }
}
