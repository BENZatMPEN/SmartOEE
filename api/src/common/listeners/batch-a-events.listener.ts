import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SocketService } from '../services/socket.service';
import { OEE_PARAM_TYPE_A } from '../constant';
import { AnalyticAParamUpdateEvent } from '../events/analytic.event';
import { logBatch } from '../utils/batchHelper';
import { NotificationService } from '../services/notification.service';
import { BatchAEvent } from '../events/batch-a.event';
import { BatchParamsUpdatedEvent } from '../events/batch.event';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';

@Injectable()
export class BatchAEventsListener {
  private readonly logger = new Logger(BatchAEventsListener.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('batch-a-params.process', { async: true })
  async processA(event: BatchAEvent): Promise<void> {
    const { batch, previousMcState, reads, readTimestamp } = event;

    logBatch(
      this.logger,
      batch.id,
      batch.oee.oeeCode,
      `A - breakdown: ${previousMcState.stopSeconds}, (settings: ${batch.breakdownSeconds})`,
    );

    const { machines, siteId, oeeId, product } = batch;
    const mcParamAs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_A && param.tagId))
      .flat();

    const updatingAs = mcParamAs.reduce((acc, param) => {
      const idx = reads.findIndex((read) => read.tagId === param.tagId && read.read !== '0');
      if (idx < 0) {
        return acc;
      }

      acc.push({
        oeeBatchId: batch.id,
        tagId: param.tagId,
        machineId: param.machineId,
        machineParameterId: param.id,
        timestamp: readTimestamp,
        seconds: previousMcState.stopSeconds,
      });
      return acc;
    }, []);

    // this always happens once at a time
    if (updatingAs.length === 0) {
      updatingAs.push({
        oeeBatchId: batch.id,
        tagId: null,
        machineId: null,
        machineParameterId: null,
        timestamp: readTimestamp,
        seconds: previousMcState.stopSeconds,
      });
    }

    const updatingA = updatingAs[0];
    await Promise.all([
      this.oeeBatchService.createBatchA(updatingA),
      this.notify(batch, updatingA, previousMcState, readTimestamp),
    ]);

    await this.eventEmitter.emitAsync('batch-a-params.updated', new BatchParamsUpdatedEvent(batch.id, 0, false));
    await this.eventEmitter.emitAsync(
      'analytic-a-params.update',
      new AnalyticAParamUpdateEvent(siteId, oeeId, product.id, batch.id, readTimestamp, [
        {
          tagId: updatingA.tagId,
          seconds: updatingA.seconds,
          machineId: updatingA.machineId,
          machineParameterId: updatingA.machineParameterId,
        },
      ]),
    );
  }

  private async notify(
    batch: OeeBatchEntity,
    updatingA: any,
    previousMcState: OeeBatchMcState,
    readTimestamp: Date,
  ): Promise<void> {
    const notiName = 'breakdown';
    const notification = await this.notificationService.findOeeBatchNotification(batch.id, notiName);

    if (notification && notification.active) {
      await this.notificationService.deactivateOeeBatchNotification(notification.id);
      await this.notificationService.notifyAParam(
        batch.siteId,
        batch.oeeId,
        batch.id,
        updatingA.tagId,
        readTimestamp,
        previousMcState.stopSeconds,
      );
    }
  }
}
