import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';
import { ReadItem } from '../type/read';

export class BatchQEvent {
  batch: OeeBatchEntity;
  reads: ReadItem[];

  constructor(batch: OeeBatchEntity, reads: ReadItem[]) {
    this.batch = batch;
    this.reads = reads;
  }
}
