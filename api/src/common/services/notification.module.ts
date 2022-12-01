import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { LineNotifyService } from './line-notify.service';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from '../entities/alarm';
import { HistoryLog } from '../entities/history-log';
import { HttpModule } from '@nestjs/axios';
import * as https from 'https';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../configuration';
import { Oee } from '../entities/oee';
import { OeeBatch } from '../entities/oee-batch';
import { OeeBatchA } from '../entities/oee-batch-a';
import { OeeBatchP } from '../entities/oee-batch-p';
import { OeeBatchQ } from '../entities/oee-batch-q';
import { OeeBatchPlannedDowntime } from '../entities/oee-batch-planned-downtime';
import { TagRead } from '../entities/tag-read';
import { Site } from '../entities/site';
import { LogService } from './log.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { OeeProduct } from '../entities/oee-product';
import { OeeMachine } from '../entities/oee-machine';
import { OeeBatchHistory } from '../entities/oee-batch-history';
import { OeeBatchStatsTimeline } from '../entities/oee-batch-stats-timeline';
import { OeeBatchStats } from '../entities/oee-batch-stats';
import { OeeBatchLog } from '../entities/oee-batch-logs';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Site,
      Oee,
      OeeMachine,
      OeeProduct,
      OeeBatch,
      OeeBatchA,
      OeeBatchP,
      OeeBatchQ,
      OeeBatchPlannedDowntime,
      OeeBatchHistory,
      OeeBatchStatsTimeline,
      OeeBatchStats,
      OeeBatchLog,
      TagRead,
      Alarm,
      HistoryLog,
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
