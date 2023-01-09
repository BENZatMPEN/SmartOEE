import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { LineNotifyService } from './line-notify.service';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmEntity } from '../entities/alarm-entity';
import { HistoryLogEntity } from '../entities/history-log-entity';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../configuration';
import { OeeEntity } from '../entities/oee-entity';
import { OeeBatchEntity } from '../entities/oee-batch-entity';
import { OeeBatchAEntity } from '../entities/oee-batch-a-entity';
import { OeeBatchPEntity } from '../entities/oee-batch-p-entity';
import { OeeBatchQEntity } from '../entities/oee-batch-q-entity';
import { OeeBatchPlannedDowntimeEntity } from '../entities/oee-batch-planned-downtime-entity';
import { TagReadEntity } from '../entities/tag-read-entity';
import { SiteEntity } from '../entities/site-entity';
import { LogService } from './log.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { OeeProductEntity } from '../entities/oee-product-entity';
import { OeeMachineEntity } from '../entities/oee-machine-entity';
import { OeeBatchEditHistoryEntity } from '../entities/oee-batch-edit-history-entity';
import { OeeBatchStatsTimelineEntity } from '../entities/oee-batch-stats-timeline-entity';
import { OeeBatchStatsEntity } from '../entities/oee-batch-stats-entity';
import { OeeBatchLogEntity } from '../entities/oee-batch-logs-entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteEntity,
      OeeEntity,
      OeeMachineEntity,
      OeeProductEntity,
      OeeBatchEntity,
      OeeBatchAEntity,
      OeeBatchPEntity,
      OeeBatchQEntity,
      OeeBatchPlannedDowntimeEntity,
      OeeBatchEditHistoryEntity,
      OeeBatchStatsTimelineEntity,
      OeeBatchStatsEntity,
      OeeBatchLogEntity,
      TagReadEntity,
      AlarmEntity,
      HistoryLogEntity,
    ]),
    ConfigModule.forFeature(configuration),
    HttpModule.register({
      // TODO: remove this
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }),
  ],
  providers: [NotificationService, LineNotifyService, EmailService, OeeBatchService, LogService],
  exports: [NotificationService, LineNotifyService, EmailService],
})
export class NotificationModule {}
