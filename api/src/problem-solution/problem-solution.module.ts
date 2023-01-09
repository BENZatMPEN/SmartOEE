import { Module } from '@nestjs/common';
import { ProblemSolutionService } from './problem-solution.service';
import { ProblemSolutionController } from './problem-solution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from '../common/entities/attachment-entity';
import { ProblemSolutionEntity } from '../common/entities/problem-solution-entity';
import { ProblemSolutionAttachmentEntity } from '../common/entities/problem-solution-attachment-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttachmentEntity, ProblemSolutionEntity, ProblemSolutionAttachmentEntity, SiteEntity]),
  ],
  controllers: [ProblemSolutionController],
  providers: [ProblemSolutionService, FileService],
})
export class ProblemSolutionModule {}
