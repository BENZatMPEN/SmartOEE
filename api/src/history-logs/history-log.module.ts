import { Module } from '@nestjs/common';
import { HistoryLogService } from './history-log.service';
import { HistoryLogController } from './history-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { HistoryLogEntity } from '../common/entities/history-log-entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryLogEntity, SiteEntity])],
  controllers: [HistoryLogController],
  providers: [HistoryLogService],
})
export class HistoryLogModule {}
