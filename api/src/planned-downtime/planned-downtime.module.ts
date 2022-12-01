import { Module } from '@nestjs/common';
import { PlannedDowntimeService } from './planned-downtime.service';
import { PlannedDowntimeController } from './planned-downtime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlannedDowntime } from '../common/entities/planned-downtime';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';

@Module({
  imports: [TypeOrmModule.forFeature([PlannedDowntime, Site])],
  controllers: [PlannedDowntimeController],
  providers: [PlannedDowntimeService, SiteIdPipe],
})
export class PlannedDowntimeModule {}
