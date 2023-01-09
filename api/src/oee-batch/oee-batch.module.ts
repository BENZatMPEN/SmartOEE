import { Module } from '@nestjs/common';
import { OeeBatchService } from './oee-batch.service';
import { OeeBatchController } from './oee-batch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OeeEntity } from '../common/entities/oee-entity';
import { OeeProductEntity } from '../common/entities/oee-product-entity';
import { OeeMachineEntity } from '../common/entities/oee-machine-entity';
import { OeeBatchEntity } from '../common/entities/oee-batch-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { OeeBatchQEntity } from '../common/entities/oee-batch-q-entity';
import { OeeBatchPlannedDowntimeEntity } from '../common/entities/oee-batch-planned-downtime-entity';
import { OeeBatchAEntity } from '../common/entities/oee-batch-a-entity';
import { OeeBatchPEntity } from '../common/entities/oee-batch-p-entity';
import { TagReadEntity } from '../common/entities/tag-read-entity';
import { OeeBatchEditHistoryEntity } from '../common/entities/oee-batch-edit-history-entity';
import { OeeBatchStatsTimelineEntity } from '../common/entities/oee-batch-stats-timeline-entity';
import { OeeBatchStatsEntity } from '../common/entities/oee-batch-stats-entity';
import { OeeBatchLogEntity } from '../common/entities/oee-batch-logs-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OeeEntity,
      OeeProductEntity,
      OeeMachineEntity,
      OeeBatchEntity,
      SiteEntity,
      OeeBatchAEntity,
      OeeBatchPEntity,
      OeeBatchQEntity,
      OeeBatchPlannedDowntimeEntity,
      OeeBatchEditHistoryEntity,
      OeeBatchStatsTimelineEntity,
      OeeBatchStatsEntity,
      OeeBatchLogEntity,
      TagReadEntity,
    ]),
  ],
  controllers: [OeeBatchController],
  providers: [OeeBatchService],
})
export class OeeBatchModule {}
