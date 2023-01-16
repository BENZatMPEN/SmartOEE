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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { ProblemSolutionService } from './problem-solution.service';
import { CreateProblemSolutionDto } from './dto/create-problem-solution.dto';
import { FilterProblemSolutionDto } from './dto/filter-problem-solution.dto';
import { UpdateProblemSolutionDto } from './dto/update-problem-solution.dto';
import { ProblemSolutionEntity } from '../common/entities/problem-solution-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorators/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id.pipe';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileInfo } from '../common/type/file-info';
import { FileService } from '../common/services/file.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('problems-solutions')
export class ProblemSolutionController {
  constructor(
    private readonly problemSolutionService: ProblemSolutionService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  findFilter(@Query() filterDto: FilterProblemSolutionDto): Promise<PagedLisDto<ProblemSolutionEntity>> {
    return this.problemSolutionService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<ProblemSolutionEntity[]> {
    return this.problemSolutionService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<ProblemSolutionEntity> {
    return this.problemSolutionService.findById(id, siteId);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createDto: CreateProblemSolutionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('siteId') siteId: number,
  ): Promise<ProblemSolutionEntity> {
    const beforeProjectChartImageInfoList = await this.saveFileInfoList('beforeProjectChartImages[]', files);
    const beforeProjectImageInfoList = await this.saveFileInfoList('beforeProjectImages[]', files);
    const afterProjectChartImageInfoList = await this.saveFileInfoList('afterProjectChartImages[]', files);
    const afterProjectImageInfoList = await this.saveFileInfoList('afterProjectImages[]', files);

    return this.problemSolutionService.create(
      createDto,
      siteId,
      beforeProjectChartImageInfoList,
      beforeProjectImageInfoList,
      afterProjectChartImageInfoList,
      afterProjectImageInfoList,
    );
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProblemSolutionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('siteId') siteId: number,
  ): Promise<ProblemSolutionEntity> {
    const beforeProjectChartImageInfoList = await this.saveFileInfoList('beforeProjectChartImages[]', files);
    const beforeProjectImageInfoList = await this.saveFileInfoList('beforeProjectImages[]', files);
    const afterProjectChartImageInfoList = await this.saveFileInfoList('afterProjectChartImages[]', files);
    const afterProjectImageInfoList = await this.saveFileInfoList('afterProjectImages[]', files);

    return this.problemSolutionService.update(
      id,
      updateDto,
      siteId,
      beforeProjectChartImageInfoList,
      beforeProjectImageInfoList,
      afterProjectChartImageInfoList,
      afterProjectImageInfoList,
    );
  }

  private async saveFileInfoList(key: string, files: Express.Multer.File[]): Promise<FileInfo[]> {
    const list: FileInfo[] = [];
    for (const file of files.filter((file) => file.fieldname === key)) {
      list.push(await this.fileService.saveFileInfo(file));
    }
    return list;
  }

  // @Post(':id/upload-files')
  // @UseInterceptors(FilesInterceptor('images'))
  // async uploadFiles(
  //   @Param('id') id: number,
  //   @Query('name') name: string,
  //   @UploadedFiles() images: Express.Multer.File[],
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @ReqDec(SiteIdPipe) siteId: number,
  // ): Promise<void> {
  //   await this.problemSolutionService.updateFiles(id, name, images);
  // }
  //
  // @Delete(':id/delete-files')
  // async deleteFiles(
  //   @Param('id') id: number,
  //   @Query() dto: IdListDto,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @ReqDec(SiteIdPipe) siteId: number,
  // ): Promise<void> {
  //   await this.problemSolutionService.deleteFiles(id, dto.ids);
  // }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.problemSolutionService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.problemSolutionService.deleteMany(ids, siteId);
  }
}
