import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { OeeBatchService } from './oee-batch.service';
import { OeeBatchController } from './oee-batch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oee } from '../common/entities/oee';
import { OeeProduct } from '../common/entities/oee-product';
import { OeeMachine } from '../common/entities/oee-machine';
import { OeeBatch } from '../common/entities/oee-batch';
import { Site } from '../common/entities/site';
import { OeeBatchQ } from '../common/entities/oee-batch-q';
import { OeeBatchPlannedDowntime } from '../common/entities/oee-batch-planned-downtime';
import { OeeBatchA } from '../common/entities/oee-batch-a';
import { OeeBatchP } from '../common/entities/oee-batch-p';
import { TagRead } from '../common/entities/tag-read';
import { OeeBatchHistory } from '../common/entities/oee-batch-history';
import { OeeBatchStatsTimeline } from '../common/entities/oee-batch-stats-timeline';
import { OeeBatchStats } from '../common/entities/oee-batch-stats';
import { OeeBatchLog } from '../common/entities/oee-batch-logs';

@Module({
  imports: [
    ContentModule,
    TypeOrmModule.forFeature([
      Oee,
      OeeProduct,
      OeeMachine,
      OeeBatch,
      Site,
      OeeBatchA,
      OeeBatchP,
      OeeBatchQ,
      OeeBatchPlannedDowntime,
      OeeBatchHistory,
      OeeBatchStatsTimeline,
      OeeBatchStats,
      OeeBatchLog,
      TagRead,
    ]),
  ],
  controllers: [OeeBatchController],
  providers: [OeeBatchService],
})
export class OeeBatchModule {}
