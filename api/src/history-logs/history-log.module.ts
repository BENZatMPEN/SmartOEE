import { Module } from '@nestjs/common';
import { HistoryLogService } from './history-log.service';
import { HistoryLogController } from './history-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../common/entities/site';
import { HistoryLog } from '../common/entities/history-log';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryLog, Site])],
  controllers: [HistoryLogController],
  providers: [HistoryLogService],
})
export class HistoryLogModule {}
