import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';
import { ReadItem } from '../type/read';

export class BatchAEvent {
  batch: OeeBatchEntity;
  previousMcState: OeeBatchMcState;
  reads: ReadItem[];
  readTimestamp: Date;

  constructor(batch: OeeBatchEntity, previousMcState: OeeBatchMcState, reads: ReadItem[], readTimestamp: Date) {
    this.batch = batch;
    this.previousMcState = previousMcState;
    this.reads = reads;
    this.readTimestamp = readTimestamp;
  }
}
