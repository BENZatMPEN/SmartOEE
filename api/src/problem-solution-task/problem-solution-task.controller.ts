import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
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
import { ProblemSolutionTaskService } from './problem-solution-task.service';
import { CreateProblemSolutionTaskDto } from './dto/create-problem-solution-task.dto';
import { UpdateProblemSolutionTaskDto } from './dto/update-problem-solution-task.dto';
import { ProblemSolutionTask } from '../common/entities/problem-solution-task';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('problems-solution-tasks')
export class ProblemSolutionTaskController {
  constructor(private readonly problemSolutionTaskService: ProblemSolutionTaskService) {}

  @Post()
  async create(
    @Query('problemSolutionId') problemSolutionId: number,
    @Body() createDto: CreateProblemSolutionTaskDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<ProblemSolutionTask> {
    // TODO: check problemSolutionId
    return this.problemSolutionTaskService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Query('problemSolutionId') problemSolutionId: number,
    @Body() updateDto: UpdateProblemSolutionTaskDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<ProblemSolutionTask> {
    // TODO: check problemSolutionId
    return this.problemSolutionTaskService.update(id, updateDto);
  }

  @Delete()
  async delete(
    @Query() dto: IdListDto,
    @Query('problemSolutionId') problemSolutionId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    // TODO: check problemSolutionId
    await this.problemSolutionTaskService.delete(dto.ids, problemSolutionId);
  }

  @Post(':id/upload-files')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(
    @Param('id') id: number,
    @Query('name') name: string,
    @Query('problemSolutionId') problemSolutionId: number,
    @UploadedFiles() images: Express.Multer.File[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    // TODO: check problemSolutionId
    await this.problemSolutionTaskService.updateFiles(id, name, images);
  }

  @Delete(':id/delete-files')
  async deleteFiles(
    @Param('id') id: number,
    @Query() dto: IdListDto,
    @Query('problemSolutionId') problemSolutionId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    // TODO: check problemSolutionId
    if (!dto.ids) {
      return;
    }
    await this.problemSolutionTaskService.deleteFiles(id, dto.ids);
  }
}
