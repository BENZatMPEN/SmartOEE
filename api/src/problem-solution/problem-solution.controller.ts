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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { ProblemSolutionService } from './problem-solution.service';
import { CreateProblemSolutionDto } from './dto/create-problem-solution.dto';
import { FilterProblemSolutionDto } from './dto/filter-problem-solution.dto';
import { UpdateProblemSolutionDto } from './dto/update-problem-solution.dto';
import { ProblemSolution } from '../common/entities/problem-solution';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('problems-solutions')
export class ProblemSolutionController {
  constructor(private readonly problemSolutionService: ProblemSolutionService) {}

  @Get()
  findFilter(
    @Query() filterDto: FilterProblemSolutionDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<ProblemSolution>> {
    return this.problemSolutionService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<ProblemSolution[]> {
    return this.problemSolutionService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<ProblemSolution> {
    const problemSolution = await this.problemSolutionService.findById(id, siteId);
    if (!problemSolution) {
      throw new NotFoundException();
    }

    return problemSolution;
  }

  @Post()
  create(
    @Body() createDto: CreateProblemSolutionDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<ProblemSolution> {
    return this.problemSolutionService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProblemSolutionDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<ProblemSolution> {
    return this.problemSolutionService.update(id, updateDto);
  }

  @Post(':id/upload-files')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(
    @Param('id') id: number,
    @Query('name') name: string,
    @UploadedFiles() images: Express.Multer.File[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.problemSolutionService.updateFiles(id, name, images);
  }

  @Delete(':id/delete-files')
  async deleteFiles(
    @Param('id') id: number,
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.problemSolutionService.deleteFiles(id, dto.ids);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.problemSolutionService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.problemSolutionService.deleteMany(dto.ids);
  }
}
