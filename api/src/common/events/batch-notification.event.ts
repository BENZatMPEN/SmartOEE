import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeStats } from '../type/oee-stats';

export class BatchNotificationEvent {
  batch: OeeBatchEntity;
  previousStatus: OeeStats;
  currentStatus: OeeStats;

  constructor(batch: OeeBatchEntity, previousStatus: OeeStats, currentStatus: OeeStats) {
    this.batch = batch;
    this.previousStatus = previousStatus;
    this.currentStatus = currentStatus;
  }
}
