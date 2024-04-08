import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OEE_TYPE_A, OEE_TYPE_OEE, OEE_TYPE_P, OEE_TYPE_Q } from '../constant';
import { NotificationService } from '../services/notification.service';
import { BatchNotificationEvent } from '../events/batch-notification.event';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeStats } from '../type/oee-stats';
import { PercentSetting } from '../type/percent-settings';
import { SiteService } from '../../site/site.service';
import { OeeBatchNotificationEntity } from '../entities/oee-batch-notification.entity';

type NotiPercentSettings = {
  oeeLow: number;
  aLow: number;
  pLow: number;
  qLow: number;
  oeeHigh: number;
  aHigh: number;
  pHigh: number;
  qHigh: number;
};

@Injectable()
export class BatchNotificationEventsListener {
  private readonly logger = new Logger(BatchNotificationEventsListener.name);

  private readonly OeeLow: string = 'oeeLow';
  private readonly OeeLowNormal: string = 'oeeLowNormal';
  private readonly ALow: string = 'aLow';
  private readonly ALowNormal: string = 'aLowNormal';
  private readonly PLow: string = 'pLow';
  private readonly PLowNormal: string = 'pLowNormal';
  private readonly QLow: string = 'qLow';
  private readonly QLowNormal: string = 'qLowNormal';
  private readonly OeeHigh: string = 'oeeHigh';
  private readonly AHigh: string = 'aHigh';
  private readonly PHigh: string = 'pHigh';
  private readonly QHigh: string = 'qHigh';

  constructor(private readonly siteService: SiteService, private readonly notificationService: NotificationService) {}

  @OnEvent('batch-notification.process', { async: true })
  async processBatchNotification(event: BatchNotificationEvent): Promise<void> {
    await this.notifyStatsChanged(event.batch, event.previousStatus, event.currentStatus);
  }

  private async notifyStatsChanged(
    batch: OeeBatchEntity,
    previousStatus: OeeStats,
    currentStatus: OeeStats,
  ): Promise<void> {
    const { oee } = batch;
    const site = await this.siteService.findById(batch.siteId);
    const percentSettings: NotiPercentSettings = this.getPercentSettings(
      oee.useSitePercentSettings ? site.defaultPercentSettings : oee.percentSettings,
    );

    const batchNotifications = await this.notificationService.findOeeBatchNotifications(batch.id);

    // OEE Low
    await this.checkLow(
      batchNotifications,
      batch.id,
      batch.oeeId,
      site.id,
      this.OeeLow,
      this.OeeLowNormal,
      percentSettings.oeeLow,
      previousStatus.oeePercent,
      currentStatus.oeePercent,
    );

    // A Low
    await this.checkLow(
      batchNotifications,
      batch.id,
      batch.oeeId,
      site.id,
      this.ALow,
      this.ALowNormal,
      percentSettings.aLow,
      previousStatus.aPercent,
      currentStatus.aPercent,
    );

    // P Low
    await this.checkLow(
      batchNotifications,
      batch.id,
      batch.oeeId,
      site.id,
      this.PLow,
      this.PLowNormal,
      percentSettings.pLow,
      previousStatus.pPercent,
      currentStatus.pPercent,
    );

    // Q Low
    await this.checkLow(
      batchNotifications,
      batch.id,
      batch.oeeId,
      site.id,
      this.QLow,
      this.QLowNormal,
      percentSettings.qLow,
      previousStatus.qPercent,
      currentStatus.qPercent,
    );

    const highThreshold = 100;

    // OEE High
    await this.checkHigh(
      batch.id,
      batch.oeeId,
      site.id,
      this.OeeHigh,
      highThreshold,
      previousStatus.oeePercent,
      currentStatus.oeePercent,
    );

    // A High
    await this.checkHigh(
      batch.id,
      batch.oeeId,
      site.id,
      this.AHigh,
      highThreshold,
      previousStatus.aPercent,
      currentStatus.aPercent,
    );

    // P High
    await this.checkHigh(
      batch.id,
      batch.oeeId,
      site.id,
      this.PHigh,
      highThreshold,
      previousStatus.pPercent,
      currentStatus.pPercent,
    );

    // Q High
    await this.checkHigh(
      batch.id,
      batch.oeeId,
      site.id,
      this.QHigh,
      highThreshold,
      previousStatus.qPercent,
      currentStatus.qPercent,
    );
  }

  private async checkLow(
    batchNotifications: OeeBatchNotificationEntity[],
    batchId: number,
    oeeId: number,
    siteId: number,
    lowName: string,
    lowNormalName: string,
    lowThreshold: number,
    previousPercent: number,
    currentPercent: number,
  ) {
    let lowNotification = batchNotifications.find((item) => item.name == lowName);

    if (currentPercent <= lowThreshold && previousPercent >= lowThreshold) {
      if (!lowNotification) {
        lowNotification = await this.notificationService.createOeeBatchNotification(lowName, batchId);
      }

      if (!lowNotification.active) {
        await this.notificationService.activateOeeBatchNotification(lowNotification.id);
        await this.notificationService.notifyOee(lowName, siteId, oeeId, batchId, previousPercent, currentPercent);
      }
    }

    if (currentPercent > lowThreshold && lowNotification && lowNotification.active) {
      await this.notificationService.deactivateOeeBatchNotification(lowNotification.id);
      await this.notificationService.notifyOee(lowNormalName, siteId, oeeId, batchId, previousPercent, currentPercent);
    }
  }

  private async checkHigh(
    batchId: number,
    oeeId: number,
    siteId: number,
    highName: string,
    highThreshold: number,
    previousPercent: number,
    currentPercent: number,
  ) {
    if (currentPercent >= highThreshold && previousPercent < highThreshold) {
      await this.notificationService.notifyOee(highName, siteId, oeeId, batchId, previousPercent, currentPercent);
    }
  }

  private getPercentSettings(settings: PercentSetting[]): NotiPercentSettings {
    return {
      oeeLow: settings.filter((item) => item.type === OEE_TYPE_OEE)[0].settings.low,
      aLow: settings.filter((item) => item.type === OEE_TYPE_A)[0].settings.low,
      pLow: settings.filter((item) => item.type === OEE_TYPE_P)[0].settings.low,
      qLow: settings.filter((item) => item.type === OEE_TYPE_Q)[0].settings.low,
      oeeHigh: settings.filter((item) => item.type === OEE_TYPE_OEE)[0].settings.high,
      aHigh: settings.filter((item) => item.type === OEE_TYPE_A)[0].settings.high,
      pHigh: settings.filter((item) => item.type === OEE_TYPE_P)[0].settings.high,
      qHigh: settings.filter((item) => item.type === OEE_TYPE_Q)[0].settings.high,
    };
  }
}
