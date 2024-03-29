import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site.entity';
import { AnalyticEntity } from '../common/entities/analytic.entity';
import { UserEntity } from '../common/entities/user.entity';
import { OeeEntity } from '../common/entities/oee.entity';
import { ProductEntity } from '../common/entities/product.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { OeeBatchStatsEntity } from '../common/entities/oee-batch-stats.entity';
import { OeeBatchStatsTimelineEntity } from '../common/entities/oee-batch-stats-timeline.entity';
import { OeeBatchAEntity } from '../common/entities/oee-batch-a.entity';
import { OeeBatchPEntity } from '../common/entities/oee-batch-p.entity';
import { OeeBatchQEntity } from '../common/entities/oee-batch-q.entity';
import { AnalyticStatsParamEntity } from '../common/entities/analytic-stats-param.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteEntity,
      UserEntity,
      OeeEntity,
      ProductEntity,
      OeeBatchEntity,
      OeeBatchStatsEntity,
      OeeBatchStatsTimelineEntity,
      AnalyticEntity,
      AnalyticStatsParamEntity,
      OeeBatchAEntity,
      OeeBatchPEntity,
      OeeBatchQEntity,
    ]),
  ],
  controllers: [AnalyticController],
  providers: [AnalyticService],
})
export class AnalyticModule {}
