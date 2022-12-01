import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { ProblemSolutionService } from './problem-solution.service';
import { ProblemSolutionController } from './problem-solution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from '../common/entities/attachment';
import { ProblemSolution } from '../common/entities/problem-solution';
import { ProblemSolutionAttachment } from '../common/entities/problem-solution-attachment';
import { Site } from '../common/entities/site';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Attachment, ProblemSolution, ProblemSolutionAttachment, Site])],
  controllers: [ProblemSolutionController],
  providers: [ProblemSolutionService],
})
export class ProblemSolutionModule {}
