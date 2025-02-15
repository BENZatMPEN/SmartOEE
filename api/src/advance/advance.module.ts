import { Module } from '@nestjs/common';
import { AdvanceController } from './advance.controller';
import { AdvanceService } from './advance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from 'src/common/entities/site.entity';
import { OeeEntity } from 'src/common/entities/oee.entity';
import { OeeBatchEntity } from 'src/common/entities/oee-batch.entity';
import { ProductEntity } from 'src/common/entities/product.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OeeWorkTimeEntity } from 'src/common/entities/oee-work-time.entity';
import { OeeBatchStatsEntity } from 'src/common/entities/oee-batch-stats.entity';
import { AndonOeeEntity } from 'src/common/entities/andon-oee.entity';
import { AndonColumnEntity } from 'src/common/entities/andon-column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteEntity,
      OeeEntity,
      ProductEntity,
      OeeBatchEntity,
      UserEntity,
      OeeWorkTimeEntity,
      OeeBatchStatsEntity,
      AndonOeeEntity,
      AndonColumnEntity,
    ]),
  ],
  controllers: [AdvanceController],
  providers: [AdvanceService],
})
export class AdvanceModule {}
