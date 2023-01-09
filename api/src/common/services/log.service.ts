import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryLogEntity } from '../entities/history-log-entity';
import { Repository } from 'typeorm';
import { HISTORY_LOG_TYPE_ACTION, HISTORY_LOG_TYPE_ALARM } from '../constant';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(HistoryLogEntity)
    private historyLogRepository: Repository<HistoryLogEntity>,
  ) {}

  async logAlarm(siteId: number, message: string): Promise<void> {
    await this.historyLogRepository.save({
      siteId: siteId,
      type: HISTORY_LOG_TYPE_ALARM,
      message: message,
      createdAt: new Date(),
    });
  }

  async logAction(siteId: number, message: string): Promise<void> {
    await this.historyLogRepository.save({
      siteId: siteId,
      type: HISTORY_LOG_TYPE_ACTION,
      message: message,
      createdAt: new Date(),
    });
  }
}
