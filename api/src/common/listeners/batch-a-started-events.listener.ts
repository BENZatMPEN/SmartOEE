import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { logBatch } from '../utils/batchHelper';
import { NotificationService } from '../services/notification.service';
import { BatchAEvent } from '../events/batch-a.event';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';

@Injectable()
export class BatchAStartedEventsListener {
  private readonly logger = new Logger(BatchAStartedEventsListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('batch-a-started-params.process', { async: true })
  async processAStarted(event: BatchAEvent): Promise<void> {
    const { batch, previousMcState, readTimestamp } = event;

    logBatch(
      this.logger,
      batch.id,
      batch.oee.oeeCode,
      `A started - breakdown: ${previousMcState.stopSeconds}, (settings: ${batch.breakdownSeconds})`,
    );

    await this.notify(batch, previousMcState, readTimestamp);
  }

  private async notify(batch: OeeBatchEntity, currentMcState: OeeBatchMcState, readTimestamp: Date): Promise<void> {
    const notiName = 'breakdown';
    let notification = await this.notificationService.findOeeBatchNotification(batch.id, notiName);

    if (!notification) {
      notification = await this.notificationService.createOeeBatchNotification(notiName, batch.id);
    }

    if (!notification.active) {
      await this.notificationService.activateOeeBatchNotification(notification.id);
      await this.notificationService.notifyAParamStarted(
        batch.siteId,
        batch.oeeId,
        batch.id,
        readTimestamp,
        currentMcState.stopSeconds,
      );
    }
  }
}
