import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatchEntity } from '../entities/oee-batch.entity';

export class BatchMcStateUpdateEvent {
  batch: OeeBatchEntity;
  currentMcState: OeeBatchMcState;

  constructor(batch: OeeBatchEntity, currentMcState: OeeBatchMcState) {
    this.batch = batch;
    this.currentMcState = currentMcState;
  }
}

export class BatchTimelineUpdateEvent {
  batch: OeeBatchEntity;
  previousMcState: OeeBatchMcState;
  currentMcState: OeeBatchMcState;

  constructor(batch: OeeBatchEntity, previousMcState: OeeBatchMcState, currentMcState: OeeBatchMcState) {
    this.batch = batch;
    this.previousMcState = previousMcState;
    this.currentMcState = currentMcState;
  }
}

export class BatchParamsUpdatedEvent {
  batchId: number;
  totalOther: number;
  createLog: boolean;

  constructor(batchId: number, totalOther: number, createLog: boolean) {
    this.batchId = batchId;
    this.totalOther = totalOther;
    this.createLog = createLog;
  }
}
