import { OeeBatchMcState } from '../type/oee-status';

export class BatchMcStateUpdateEvent {
  siteId: number;
  batchId: number;
  currentMcState: OeeBatchMcState;

  constructor(siteId: number, batchId: number, currentMcState: OeeBatchMcState) {
    this.siteId = siteId;
    this.batchId = batchId;
    this.currentMcState = currentMcState;
  }
}

export class BatchTimelineUpdateEvent {
  siteId: number;
  batchId: number;
  previousMcState: OeeBatchMcState;
  currentMcState: OeeBatchMcState;

  constructor(siteId: number, batchId: number, previousMcState: OeeBatchMcState, currentMcState: OeeBatchMcState) {
    this.siteId = siteId;
    this.batchId = batchId;
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
