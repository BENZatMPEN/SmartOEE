import { Module } from '@nestjs/common';
import { ProblemSolutionTaskService } from './problem-solution-task.service';
import { ProblemSolutionTaskController } from './problem-solution-task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from '../common/entities/attachment.entity';
import { ProblemSolutionTaskEntity } from '../common/entities/problem-solution-task.entity';
import { ProblemSolutionTaskAttachmentEntity } from '../common/entities/problem-solution-task-attachment.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttachmentEntity,
      ProblemSolutionTaskEntity,
      ProblemSolutionTaskAttachmentEntity,
      SiteEntity,
    ]),
  ],
  controllers: [ProblemSolutionTaskController],
  providers: [ProblemSolutionTaskService, FileService],
})
export class ProblemSolutionTaskModule {}
