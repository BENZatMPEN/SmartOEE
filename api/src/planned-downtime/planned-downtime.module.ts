import { Module } from '@nestjs/common';
import { PlannedDowntimeService } from './planned-downtime.service';
import { PlannedDowntimeController } from './planned-downtime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlannedDowntimeEntity } from '../common/entities/planned-downtime.entity';
import { SiteIdPipe } from '../common/pipe/site-id.pipe';
import { SiteEntity } from '../common/entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlannedDowntimeEntity])],
  controllers: [PlannedDowntimeController],
  providers: [PlannedDowntimeService, SiteIdPipe],
})
export class PlannedDowntimeModule {}
