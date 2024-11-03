import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { AnalyticQParamUpdateEvent } from '../events/analytic.event';
import { logBatch } from '../utils/batchHelper';
import { NotificationService } from '../services/notification.service';
import { BatchQEvent } from '../events/batch-q.event';
import { BatchParamsUpdatedEvent } from '../events/batch.event';

@Injectable()
export class BatchQEventsListener {
  private readonly logger = new Logger(BatchQEventsListener.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('batch-q-params.process', { async: true })
  async processQ(event: BatchQEvent): Promise<void> {
    const { batch, reads, readTimestamp } = event;
    const { siteId, oeeId, product } = batch;
    const currentParams = await this.oeeBatchService.findBatchQsById(batch.id);
    const updatingParams = currentParams.reduce((acc, param) => {
      const idx = reads.findIndex((read) => read.tagId === param.tagId && Number(read.read) > param.autoAmount);
      if (idx < 0) {
        return acc;
      }

      const newRead = Number(reads[idx].read);
      acc.push({
        id: param.id,
        autoAmount: newRead,
      });
      return acc;
    }, []);

    const updatingParam = updatingParams[0];
    const currentParam = currentParams.filter((item) => item.id === updatingParam.id)[0];

    await this.eventEmitter.emitAsync(
      'analytic-q-params.update',
      new AnalyticQParamUpdateEvent(siteId, oeeId, product.id, batch.id, readTimestamp, [
        {
          autoAmount: updatingParam.autoAmount - currentParam.autoAmount,
          manualAmount: 0,
          tagId: currentParam.tagId,
          machineId: currentParam.machineId,
          machineParameterId: currentParam.machineParameterId,
        },
      ]),
    );

    logBatch(
      this.logger,
      batch.id,
      batch.oee.oeeCode,
      `Q - Id: ${currentParam.id} (${currentParam.tagId}) - previous: ${currentParam.autoAmount}, current: ${updatingParam.autoAmount}`,
    );

    await this.oeeBatchService.updateBatchQ(updatingParam);
    await this.notificationService.notifyQParam(
      batch.siteId,
      batch.oeeId,
      batch.id,
      currentParam.tagId,
      currentParam.autoAmount,
      updatingParam.autoAmount,
    );

    await this.eventEmitter.emitAsync('batch-q-params.updated', new BatchParamsUpdatedEvent(batch.id, 0, false));
  }
}
