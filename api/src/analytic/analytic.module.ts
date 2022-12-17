import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../common/entities/site';
import { Analytic } from '../common/entities/analytic';
import { AnalyticStats } from '../common/entities/analytic-stats';
import { User } from '../common/entities/user';
import { Oee } from '../common/entities/oee';
import { Product } from '../common/entities/product';
import { OeeBatch } from '../common/entities/oee-batch';
import { OeeBatchStats } from '../common/entities/oee-batch-stats';
import { OeeBatchStatsTimeline } from '../common/entities/oee-batch-stats-timeline';
import { OeeBatchA } from '../common/entities/oee-batch-a';
import { OeeBatchP } from '../common/entities/oee-batch-p';
import { OeeBatchQ } from '../common/entities/oee-batch-q';
import { AnalyticStatsParam } from '../common/entities/analytic-stats-param';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Site,
      User,
      Oee,
      Product,
      OeeBatch,
      OeeBatchStats,
      OeeBatchStatsTimeline,
      Analytic,
      AnalyticStats,
      AnalyticStatsParam,
      OeeBatchA,
      OeeBatchP,
      OeeBatchQ,
    ]),
  ],
  controllers: [AnalyticController],
  providers: [AnalyticService],
})
export class AnalyticModule {}
