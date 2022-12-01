import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatch } from '../entities/oee-batch';
import { Read } from '../type/read';

export class BatchOeeCalculateEvent {
  batchId: number;
  // currentMcState: OeeBatchMcState;
  tagRead: Read;
}

export class BatchParamCalculateEvent {
  batchId: number;
}
