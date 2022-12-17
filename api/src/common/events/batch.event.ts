import { OeeBatchMcState } from '../type/oee-status';

export class BatchMcStateUpdateEvent {
  siteId: number;
  batchId: number;
  currentMcState: OeeBatchMcState;
}

export class BatchTimelineUpdateEvent {
  siteId: number;
  batchId: number;
  previousMcState: OeeBatchMcState;
  currentMcState: OeeBatchMcState;
}

export class BatchParamsUpdatedEvent {
  batchId: number;
  totalOther: number;
  createLog: boolean;
}
