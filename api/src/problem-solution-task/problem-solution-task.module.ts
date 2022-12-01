import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { ProblemSolutionTaskService } from './problem-solution-task.service';
import { ProblemSolutionTaskController } from './problem-solution-task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from '../common/entities/attachment';
import { ProblemSolutionTask } from '../common/entities/problem-solution-task';
import { ProblemSolutionTaskAttachment } from '../common/entities/problem-solution-task-attachment';
import { Site } from '../common/entities/site';

@Module({
  imports: [
    ContentModule,
    TypeOrmModule.forFeature([Attachment, ProblemSolutionTask, ProblemSolutionTaskAttachment, Site]),
  ],
  controllers: [ProblemSolutionTaskController],
  providers: [ProblemSolutionTaskService],
})
export class ProblemSolutionTaskModule {}
