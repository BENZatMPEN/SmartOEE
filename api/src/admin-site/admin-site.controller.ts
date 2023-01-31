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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { AdminSiteService } from './admin-site.service';
import { CreateAdminSiteDto } from './dto/create-admin-site.dto';
import { FilterAdminSiteDto } from './dto/filter-admin-site.dto';
import { UpdateAdminSiteDto } from './dto/update-admin-site.dto';
import { SiteEntity } from '../common/entities/site-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { OptionItem } from '../common/type/option-item';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/admin/sites')
export class AdminSiteController {
  constructor(private readonly siteService: AdminSiteService) {}

  @Get('options')
  findOptions(): Promise<OptionItem[]> {
    return this.siteService.findOptions();
  }

  @Get()
  findFilter(@Query() filterDto: FilterAdminSiteDto): Promise<PagedLisDto<SiteEntity>> {
    return this.siteService.findPagedList(filterDto);
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<SiteEntity> {
    return this.siteService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createDto: CreateAdminSiteDto, @UploadedFile(FileSavePipe) image: string): Promise<any> {
    return this.siteService.create(createDto, image);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAdminSiteDto,
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
}
