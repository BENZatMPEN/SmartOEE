import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardEntity } from '../common/entities/dashboard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryLogEntity } from '../common/entities/history-log.entity';
import { LogService } from '../common/services/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardEntity, HistoryLogEntity])],
  controllers: [DashboardController],
  providers: [DashboardService, LogService],
  exports: [DashboardService],
})
export class DashboardModule {}
