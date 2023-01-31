import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqEntity } from '../common/entities/faq-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '../common/services/file.service';
import { FileInfo } from '../common/type/file-info';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService, private readonly fileService: FileService) {}

  @Get()
  findFilter(@Query() filterDto: FilterFaqDto): Promise<PagedLisDto<FaqEntity>> {
    return this.faqService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<FaqEntity[]> {
    return this.faqService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<FaqEntity> {
    const faq = await this.faqService.findById(id, siteId);
    if (!faq) {
      throw new NotFoundException();
    }

    return faq;
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createDto: CreateFaqDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('siteId') siteId: number,
  ): Promise<FaqEntity> {
    const imageInfoList = await this.saveFileInfoList('images[]', files);
    const fileInfoList = await this.saveFileInfoList('files[]', files);

    return this.faqService.create(createDto, siteId, imageInfoList, fileInfoList);
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateFaqDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('siteId') siteId: number,
  ): Promise<FaqEntity> {
    const imageInfoList = await this.saveFileInfoList('images[]', files);
    const fileInfoList = await this.saveFileInfoList('files[]', files);

    return this.faqService.update(id, updateDto, siteId, imageInfoList, fileInfoList);
  }

  private async saveFileInfoList(key: string, files: Express.Multer.File[]): Promise<FileInfo[]> {
    const list: FileInfo[] = [];
    for (const file of files.filter((file) => file.fieldname === key)) {
      list.push(await this.fileService.saveFileInfo(file));
    }
    return list;
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.faqService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.faqService.deleteMany(ids, siteId);
  }
}
