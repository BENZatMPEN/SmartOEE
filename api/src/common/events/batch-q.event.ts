import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';
import { ReadItem } from '../type/read';

export class BatchQEvent {
  batch: OeeBatchEntity;
  reads: ReadItem[];
  readTimestamp: Date;

  constructor(batch: OeeBatchEntity, reads: ReadItem[], readTimestamp: Date) {
    this.batch = batch;
    this.reads = reads;
    this.readTimestamp = readTimestamp;
  }
}
