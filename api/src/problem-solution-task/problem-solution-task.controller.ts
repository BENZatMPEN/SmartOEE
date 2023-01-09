import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProblemSolutionTaskService } from './problem-solution-task.service';
import { CreateProblemSolutionTaskDto } from './dto/create-problem-solution-task.dto';
import { UpdateProblemSolutionTaskDto } from './dto/update-problem-solution-task.dto';
import { ProblemSolutionTaskEntity } from '../common/entities/problem-solution-task-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInfo } from '../common/type/file-info';
import { FileService } from '../common/services/file.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('problems-solution-tasks')
export class ProblemSolutionTaskController {
  constructor(
    private readonly problemSolutionTaskService: ProblemSolutionTaskService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createDto: CreateProblemSolutionTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProblemSolutionTaskEntity> {
    const fileInfoList = await this.saveFileInfoList(files.filter((file) => file.fieldname === 'addingFiles[]'));
    // TODO: check problemSolutionId
    return this.problemSolutionTaskService.create(createDto, fileInfoList);
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: number,
    @Query('problemSolutionId') problemSolutionId: number,
    @Body() updateDto: UpdateProblemSolutionTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProblemSolutionTaskEntity> {
    const fileInfoList = await this.saveFileInfoList(files.filter((file) => file.fieldname === 'addingFiles[]'));
    // TODO: check problemSolutionId
    return this.problemSolutionTaskService.update(id, updateDto, problemSolutionId, fileInfoList);
  }

  private async saveFileInfoList(files: Express.Multer.File[]): Promise<FileInfo[]> {
    const list: FileInfo[] = [];
    for (const file of files) {
      list.push(await this.fileService.saveFileInfo(file));
    }
    return list;
  }

  @Delete()
  async delete(
    @Query('problemSolutionId') problemSolutionId: number,
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ): Promise<void> {
    // TODO: check problemSolutionId
    await this.problemSolutionTaskService.delete(ids, problemSolutionId);
  }

  // @Post(':id/upload-files')
  // @UseInterceptors(FilesInterceptor('images'))
  // async uploadFiles(
  //   @Param('id') id: number,
  //   @Query('name') name: string,
  //   @Query('problemSolutionId') problemSolutionId: number,
  //   @UploadedFiles() images: Express.Multer.File[],
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @ReqDec(SiteIdPipe) siteId: number,
  // ): Promise<void> {
  //   // TODO: check problemSolutionId
  //   await this.problemSolutionTaskService.updateFiles(id, name, images);
  // }
  //
  // @Delete(':id/delete-files')
  // async deleteFiles(
  //   @Param('id') id: number,
  //   @Query() dto: IdListDto,
  //   @Query('problemSolutionId') problemSolutionId: number,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @ReqDec(SiteIdPipe) siteId: number,
  // ): Promise<void> {
  //   // TODO: check problemSolutionId
  //   if (!dto.ids) {
  //     return;
  //   }
  //   await this.problemSolutionTaskService.deleteFiles(id, dto.ids);
  // }
}
