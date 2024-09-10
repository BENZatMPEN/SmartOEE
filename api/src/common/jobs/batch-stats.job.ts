import { Injectable, Logger } from '@nestjs/common';
import { SocketService } from '../services/socket.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { OeeBatchJobEntity } from '../entities/oee-batch-job.entity';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { OeeBatchMcState } from '../type/oee-status';
import { OeeTag } from '../type/oee-tag';
import * as dayjs from 'dayjs';
import {
  OEE_TAG_OUT_A,
  OEE_TAG_OUT_BREAKING_TIME,
  OEE_TAG_OUT_CYCLE_TIME,
  OEE_TAG_OUT_OEE,
  OEE_TAG_OUT_OPERATING_TIME,
  OEE_TAG_OUT_P,
  OEE_TAG_OUT_PLANNED_DOWNTIME,
  OEE_TAG_OUT_PLANNED_QUANTITY,
  OEE_TAG_OUT_Q,
  OEE_TAG_OUT_TOTAL_NG,
  PLANNED_DOWNTIME_TYPE_MC_SETUP,
  PLANNED_DOWNTIME_TYPE_PLANNED,
} from '../constant';
import { OeeStats } from '../type/oee-stats';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { logBatch } from '../utils/batchHelper';
import { BatchNotificationEvent } from '../events/batch-notification.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BatchStatsJob {
  private readonly logger = new Logger(BatchStatsJob.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(OeeBatchJobEntity)
    private readonly oeeBatchJobRepository: Repository<OeeBatchJobEntity>,
  ) {}

  async handleCron() {
    const batchJobs = await this.oeeBatchJobRepository.find({ where: { batchJobEnded: IsNull() } });
    this.processBatchJobs(batchJobs);
  }

  private processBatchJobs(batchJobs: OeeBatchJobEntity[]) {
    batchJobs.forEach(async (batchJob) => {
      await this.processBatchJob(batchJob);
    });
  }

  private async processBatchJob(batchJob: OeeBatchJobEntity) {
    const batch = await this.oeeBatchService.findWithOeeById(batchJob.oeeBatchId);
    const { oeeCode, tags: oeeTags } = batch.oee || { oeeCode: '', tags: [] };

    const { mcState: previousMcState } = batchJob;
    const { mcState: currentMcState } = batch;

    if (!previousMcState) {
      await this.oeeBatchJobRepository.save({
        id: batchJob.id,
        mcState: batch.mcState,
      });
      return;
    }

    logBatch(this.logger, batch.id, oeeCode, 'Calculate stats');
    await this.calculateBatchOee(batch, previousMcState, currentMcState, oeeTags);

    await this.oeeBatchJobRepository.save({
      id: batchJob.id,
      mcState: batch.mcState,
    });

    if (batch.batchStoppedDate) {
      await this.oeeBatchJobRepository.save({
        id: batchJob.id,
        batchJobEnded: new Date(),
      });
    }
  }

  private async calculateBatchOee(
    batch: OeeBatchEntity,
    previousMcState: OeeBatchMcState,
    currentMcState: OeeBatchMcState,
    oeeTags: OeeTag[],
  ) {
    try {
      const { batchStartedDate, standardSpeedSeconds, oeeStats, breakdownSeconds, plannedQuantity } = batch;
      const { total, totalNg, stopSeconds, timestamp } = currentMcState;
      const { total: previousTotal } = previousMcState;
      const readTimestamp = new Date(timestamp);
      const { totalManualDefects, totalManualGrams } = oeeStats;

      const childrenResult = await Promise.all([
        this.oeeBatchService.findBatchAsById(batch.id),
        this.oeeBatchService.findBatchPsById(batch.id),
        this.oeeBatchService.findBatchQsById(batch.id),
        this.oeeBatchService.findBatchPlannedDowntimesById(batch.id),
      ]);

      const aParams = childrenResult[0];
      const pParams = childrenResult[1];
      const qParams = childrenResult[2];
      const plannedDowntimes = childrenResult[3] || [];

      const startTime = dayjs(batchStartedDate);
      const endTime = dayjs(readTimestamp);

      const runningSeconds = endTime.diff(startTime, 's');
      const plannedDowntimeSeconds = plannedDowntimes
        .filter((item) => item.type === PLANNED_DOWNTIME_TYPE_PLANNED)
        .reduce((acc, item) => {
          const endedAt = item.expiredAt ? item.expiredAt : endTime;
          return acc + dayjs(endedAt).diff(item.createdAt, 's');
        }, 0);

      const totalBreakdownCount = aParams.length;
      const aStopSeconds = stopSeconds >= breakdownSeconds ? stopSeconds : 0;
      const totalBreakdownSeconds = aParams.reduce((acc, x) => acc + x.seconds, 0) + aStopSeconds;
      const loadingSeconds = runningSeconds - plannedDowntimeSeconds;
      const operatingSeconds = loadingSeconds - totalBreakdownSeconds;

      // calculate A
      const aPercent = operatingSeconds / loadingSeconds;

      // calculate P
      const speedLossList = pParams.filter((x) => x.isSpeedLoss);
      const minorStopList = pParams.filter((x) => !x.isSpeedLoss);
      const totalSpeedLossCount = speedLossList.length;
      const totalSpeedLossSeconds = speedLossList.reduce((acc, x) => acc + x.seconds, 0);
      const totalMinorStopCount = minorStopList.length;
      const totalMinorStopSeconds = minorStopList.reduce((acc, x) => acc + x.seconds, 0);
      const pStopSeconds = stopSeconds >= standardSpeedSeconds && stopSeconds < breakdownSeconds ? stopSeconds : 0;
      const pPercent = total === 0 ? 1 : (standardSpeedSeconds * total) / operatingSeconds;

      // const usePreviousP = total - previousTotal === 0 && pStopSeconds === 0 && aStopSeconds === 0;
      // const pPercent = usePreviousP ? oeeStats.pPercent / 100 : currentPPercent;

      // calculate Q
      const totalAllDefects = totalNg + totalManualDefects;
      const sumManual = qParams.reduce((acc, x) => acc + x.manualAmount, 0);
      const totalOtherDefects = totalManualDefects - (sumManual + totalManualGrams);
      const qPercent = total === 0 ? 1 : (total - totalAllDefects) / total;

      // calculate OEE
      const oeePercent = aPercent * pPercent * qPercent;

      const target = operatingSeconds / standardSpeedSeconds;
      const efficiency = total / target;
      const totalStopSeconds = totalBreakdownSeconds + totalSpeedLossSeconds + totalMinorStopSeconds;
      // M/C setup is already INCLUDED in Breakdown - only show in the client
      const machineSetupSeconds = plannedDowntimes
        .filter((item) => item.type === PLANNED_DOWNTIME_TYPE_MC_SETUP)
        .reduce((acc, item) => {
          const endedAt = item.expiredAt ? item.expiredAt : endTime;
          return acc + dayjs(endedAt).diff(item.createdAt, 's');
        }, 0);

      const currentStats: OeeStats = {
        aPercent: aPercent * 100,
        pPercent: pPercent * 100,
        qPercent: qPercent * 100,
        oeePercent: oeePercent * 100,
        // A & P
        runningSeconds,
        loadingSeconds,
        operatingSeconds,
        plannedDowntimeSeconds,
        machineSetupSeconds,
        totalStopSeconds,
        totalBreakdownCount,
        totalBreakdownSeconds,
        totalSpeedLossCount,
        totalSpeedLossSeconds,
        totalMinorStopCount,
        totalMinorStopSeconds,
        // Q
        totalCount: total,
        totalAutoDefects: totalNg,
        totalManualDefects,
        totalOtherDefects,
        totalManualGrams,

        target,
        efficiency: efficiency * 100,
        pStopSeconds,
      };

      await this.oeeBatchService.update1(batch.id, { oeeStats: currentStats });
      await this.oeeBatchService.saveBatchStats(batch.oeeId, batch.product.id, batch.id, oeeStats, readTimestamp);

      // send to socket
      this.socketService.socket.to(`site_${batch.siteId}`).emit(`stats_${batch.id}.updated`, currentStats);

      this.sendTagOut(OEE_TAG_OUT_OEE, currentStats.oeePercent.toFixed(2), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_A, currentStats.aPercent.toFixed(2), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_P, currentStats.pPercent.toFixed(2), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_Q, currentStats.qPercent.toFixed(2), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_OPERATING_TIME, currentStats.operatingSeconds.toString(), batch.siteId, oeeTags);
      this.sendTagOut(
        OEE_TAG_OUT_PLANNED_DOWNTIME,
        currentStats.plannedDowntimeSeconds.toString(),
        batch.siteId,
        oeeTags,
      );
      this.sendTagOut(OEE_TAG_OUT_BREAKING_TIME, currentStats.totalBreakdownSeconds.toString(), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_TOTAL_NG, (totalNg + totalManualDefects).toString(), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_CYCLE_TIME, standardSpeedSeconds.toString(), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_PLANNED_QUANTITY, plannedQuantity.toString(), batch.siteId, oeeTags);

      // notify
      await this.eventEmitter.emitAsync(
        'batch-notification.process',
        new BatchNotificationEvent(batch, oeeStats, currentStats),
      );
    } catch (error) {
      this.logger.log('exception', error);
    }
  }

  private sendTagOut(key: string, outVal: string, siteId: number, oeeTags: OeeTag[]): void {
    const tagOut = this.findOeeTag(key, oeeTags);
    if (tagOut !== null) {
      this.socketService.socket.to(`site_${siteId}`).emit(`tag_out`, {
        deviceId: tagOut.deviceId,
        tagId: tagOut.tagId,
        value: outVal,
      });
    }
  }

  private findOeeTag(key: string, oeeTags: OeeTag[]): OeeTag {
    const itemIndex = oeeTags.findIndex((item) => item.key === key && item.tagId);
    if (itemIndex < 0) {
      return null;
    }
    return oeeTags[itemIndex];
  }
}
