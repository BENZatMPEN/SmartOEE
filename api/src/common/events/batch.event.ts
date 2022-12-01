import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatchPlannedDowntime } from '../entities/oee-batch-planned-downtime';

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

export class BatchPlannedDowntimeUpdateEvent {
  plannedDowntime: OeeBatchPlannedDowntime;
  previousTotal: number;
  currentTotal: number;
  timestamp: Date;
}

export class BatchParamsUpdatedEvent {
  batchId: number;
  createLog: boolean;
}
