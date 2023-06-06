import { Injectable, Logger } from '@nestjs/common';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { OeeBatchJobEntity } from '../entities/oee-batch-job.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { logBatch } from '../utils/batchHelper';

@Injectable()
export class DataStoreJob {
  private readonly logger = new Logger(DataStoreJob.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(OeeBatchJobEntity)
    private readonly oeeBatchJobRepository: Repository<OeeBatchJobEntity>,
  ) {}

  async handleCron() {
    const batchJobs = await this.oeeBatchJobRepository.find({ where: { dataJobEnded: IsNull() } });
    this.processBatchJobs(batchJobs);
  }

  private processBatchJobs(batchJobs: OeeBatchJobEntity[]) {
    batchJobs.forEach(async (batchJob) => {
      await this.processBatchJob(batchJob);
    });
  }

  private async processBatchJob(batchJob: OeeBatchJobEntity) {
    const batch = await this.oeeBatchService.findWithOeeById(batchJob.oeeBatchId);
    const { oeeCode } = batch.oee || { oeeCode: '' };

    logBatch(this.logger, batch.id, oeeCode, 'Store stats');
    await this.oeeBatchService.createBatchLog(batch.id);
    await this.eventEmitter.emitAsync('analytic-oee.update', {
      batchId: batch.id,
      oeeStats: batch.oeeStats,
    });

    if (batch.batchStoppedDate && batchJob.batchJobEnded) {
      await this.oeeBatchJobRepository.save({
        id: batchJob.id,
        dataJobEnded: new Date(),
      });
    }
  }
}
