import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardEntity } from '../common/entities/dashboard-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site-entity';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardEntity, SiteEntity])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
