import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SocketService } from '../services/socket.service';
import { OEE_PARAM_TYPE_P } from '../constant';
import { AnalyticPParamUpdateEvent } from '../events/analytic.event';
import { logBatch } from '../utils/batchHelper';
import { NotificationService } from '../services/notification.service';
import { BatchPEvent } from '../events/batch-p.event';
import { BatchParamsUpdatedEvent } from '../events/batch.event';

@Injectable()
export class BatchPEventsListener {
  private readonly logger = new Logger(BatchPEventsListener.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('batch-p-params.process', { async: true })
  async processP(event: BatchPEvent): Promise<void> {
    const { batch, previousMcState, reads, readTimestamp } = event;

    if (previousMcState.stopSeconds >= batch.minorStopSeconds) {
      // minor stop
      logBatch(
        this.logger,
        batch.id,
        batch.oee.oeeCode,
        `P - minor stop: ${previousMcState.stopSeconds}, (settings: ${batch.minorStopSeconds})`,
      );

      const { machines, siteId, oeeId, product } = batch;
      const mcParamPs = machines
        .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_P && param.tagId))
        .flat();
      const updatingPs = mcParamPs.reduce((acc, param) => {
        const idx = reads.findIndex((read) => read.tagId === param.tagId && read.read !== '0');
        if (idx < 0) {
          return acc;
        }

        acc.push({
          isSpeedLoss: false,
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
      if (updatingPs.length === 0) {
        updatingPs.push({
          isSpeedLoss: false,
          oeeBatchId: batch.id,
          tagId: null,
          machineId: null,
          machineParameterId: null,
          timestamp: readTimestamp,
          seconds: previousMcState.stopSeconds,
        });
      }

      const updatingP = updatingPs[0];
      await Promise.all([
        this.oeeBatchService.createBatchP(updatingP),
        this.notificationService.notifyPParam(
          batch.siteId,
          batch.oeeId,
          batch.id,
          updatingP.tagId,
          readTimestamp,
          previousMcState.stopSeconds,
        ),
      ]);

      await this.eventEmitter.emitAsync('batch-p-params.updated', new BatchParamsUpdatedEvent(batch.id, 0, false));
      await this.eventEmitter.emitAsync(
        'analytic-p-params.update',
        new AnalyticPParamUpdateEvent(siteId, oeeId, product.id, batch.id, [
          {
            tagId: updatingP.tagId,
            seconds: updatingP.seconds,
            machineId: updatingP.machineId,
            machineParameterId: updatingP.machineParameterId,
          },
        ]),
      );
    } else {
      // speed loss
      logBatch(this.logger, batch.id, batch.oee.oeeCode, `P - speed loss: ${previousMcState.stopSeconds}`);

      await this.oeeBatchService.createBatchP({
        isSpeedLoss: true,
        oeeBatchId: batch.id,
        timestamp: readTimestamp,
        seconds: previousMcState.stopSeconds,
      });
    }
  }
}
