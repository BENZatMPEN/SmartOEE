import { Injectable, Logger } from '@nestjs/common';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import {
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_ENDED,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
  OEE_BATCH_STATUS_UNKNOWN,
  OEE_PARAM_TYPE_A,
  OEE_PARAM_TYPE_P,
  OEE_TAG_MC_STATE,
  OEE_TAG_OUT_A,
  OEE_TAG_OUT_BATCH_STATUS,
  OEE_TAG_OUT_BREAKING_TIME,
  OEE_TAG_OUT_CYCLE_TIME,
  OEE_TAG_OUT_OEE,
  OEE_TAG_OUT_OPERATING_TIME,
  OEE_TAG_OUT_P,
  OEE_TAG_OUT_PLANNED_DOWNTIME,
  OEE_TAG_OUT_PLANNED_QUANTITY,
  OEE_TAG_OUT_Q,
  OEE_TAG_OUT_TOTAL_NG,
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
  OEE_TYPE_A,
  OEE_TYPE_OEE,
  OEE_TYPE_P,
  OEE_TYPE_Q,
  PLANNED_DOWNTIME_TIMING_AUTO,
  PLANNED_DOWNTIME_TIMING_MANUAL,
  PLANNED_DOWNTIME_TIMING_TIMER,
  PLANNED_DOWNTIME_TYPE_MC_SETUP,
  PLANNED_DOWNTIME_TYPE_PLANNED,
} from '../constant';
import * as dayjs from 'dayjs';
import { BatchOeeCalculateEvent } from '../events/batch-oee-calculate.event';
import { OeeStats } from '../type/oee-stats';
import { PercentSetting } from '../type/percent-settings';
import { SiteService } from '../../site/site.service';
import { OeeService } from '../../oee/oee.service';
import { SocketService } from '../services/socket.service';
import { NotificationService } from '../services/notification.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ReadItem } from '../type/read';
import { OeeTag, OeeTagMCStatus, OeeTagOutBatchStatus } from '../type/oee-tag';
import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatchEntity } from '../entities/oee-batch-entity';
import {
  AnalyticAParamUpdateEvent,
  AnalyticPParamUpdateEvent,
  AnalyticQParamUpdateEvent,
} from '../events/analytic.event';
import { OeeBatchPlannedDowntimeEntity } from '../entities/oee-batch-planned-downtime-entity';

@Injectable()
export class BatchOeeCalculateListener {
  private readonly logger = new Logger(BatchOeeCalculateListener.name);

  constructor(
    private readonly siteService: SiteService,
    private readonly oeeService: OeeService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private findOeeTag(key: string, oeeTags: OeeTag[]): OeeTag {
    const itemIndex = oeeTags.findIndex((item) => item.key === key && item.tagId);
    if (itemIndex < 0) {
      return null;
    }
    return oeeTags[itemIndex];
  }

  private findRead(tagId: number, reads: ReadItem[]): ReadItem {
    const itemIndex = reads.findIndex((item) => item.tagId === tagId);
    if (itemIndex < 0) {
      return null;
    }
    return reads[itemIndex];
  }

  @OnEvent('batch-oee.calculate')
  private async processRead(event: BatchOeeCalculateEvent): Promise<void> {
    try {
      const { batchId, tagRead } = event;
      const readTimestamp = new Date(tagRead.timestamp);
      const allReads = tagRead.deviceReads.map((item) => item.reads).flat();
      const batch = await this.oeeBatchService.findById(batchId);
      const oee = await this.oeeService.findById(batch.oeeId);
      const oeeTags = oee.tags || [];

      const tagMcState = this.findOeeTag(OEE_TAG_MC_STATE, oeeTags);
      const tagTotal = this.findOeeTag(OEE_TAG_TOTAL, oeeTags);
      const tagTotalNg = this.findOeeTag(OEE_TAG_TOTAL_NG, oeeTags);
      if (!tagMcState || !tagTotal || !tagTotalNg) {
        this.logger.log('OEE tags are required.');
        return;
      }

      const currentTagMcState = this.findRead(tagMcState.tagId, allReads);
      const currentTagTotal = this.findRead(tagTotal.tagId, allReads);
      const currentTagTotalNg = this.findRead(tagTotalNg.tagId, allReads);

      if (!currentTagMcState || !currentTagTotal || !currentTagTotalNg) {
        this.logger.log(`Tag read doesn't contain the required values.`);
        return;
      }

      const previousMcState = batch.mcState;
      const currentMcState: OeeBatchMcState = {
        mcStatus: currentTagMcState.read,
        total: Number(currentTagTotal.read),
        totalNg: Number(currentTagTotalNg.read),
        stopSeconds: 0,
        stopTimestamp: null,
        batchStatus: OEE_BATCH_STATUS_UNKNOWN,
        timestamp: readTimestamp,
      };

      if (!previousMcState.timestamp) {
        await this.eventEmitter.emitAsync('batch-mc-state.update', {
          siteId: batch.siteId,
          batchId: batch.id,
          currentMcState: currentMcState,
        });
        return;
      }

      const activePD = await this.oeeBatchService.findActivePlannedDowntimeById(batch.id);
      if (activePD) {
        this.logger.log(`planned downtime: ${activePD.type} timing: ${activePD.timing}`);

        let expired = false;

        if (activePD.toBeExpired) {
          expired = true;
        } else {
          if (activePD.timing === PLANNED_DOWNTIME_TIMING_AUTO && currentMcState.total > previousMcState.total) {
            this.logger.log('planned downtime expired - auto');
            expired = true;
          } else if (activePD.timing === PLANNED_DOWNTIME_TIMING_TIMER) {
            const expirationDate = dayjs(activePD.createdAt).add(activePD.seconds, 's');
            const timeCounter = expirationDate.diff(dayjs(), 's');
            this.logger.log(`planned downtime - timer: ${timeCounter}`);

            if (timeCounter <= 0) {
              this.logger.log('planned downtime expired - timer');
              expired = true;
            }
          }
        }

        if (expired) {
          await this.oeeBatchService.expireActivePlannedDowntime(activePD);
          activePD.expiredAt = readTimestamp;
        }
      }

      if (dayjs(currentMcState.timestamp).isSameOrBefore(previousMcState.timestamp)) {
        return;
      }

      if (
        (!activePD && currentMcState.total === previousMcState.total) ||
        (activePD && !activePD.expiredAt && activePD.type === PLANNED_DOWNTIME_TYPE_MC_SETUP)
      ) {
        const stopDate = previousMcState.stopTimestamp ? previousMcState.stopTimestamp : dayjs().startOf('s').toDate();
        currentMcState.stopTimestamp = stopDate;
        currentMcState.stopSeconds = dayjs().startOf('s').diff(stopDate, 's');
      } else {
        currentMcState.stopTimestamp = null;
        currentMcState.stopSeconds = 0;
      }

      this.logger.log(
        `timestamp - previous: ${dayjs(previousMcState.timestamp).format('HH:mm:ss')}, current: ${dayjs(
          currentMcState.timestamp,
        ).format('HH:mm:ss')}`,
      );
      this.logger.log(`mc_status - previous: ${previousMcState.mcStatus}, current: ${currentMcState.mcStatus}`);
      this.logger.log(`total count - previous: ${previousMcState.total}, current: ${currentMcState.total}`);
      this.logger.log(`total defects - previous: ${previousMcState.totalNg}, current: ${currentMcState.totalNg}`);
      this.logger.log(`stop count - previous: ${previousMcState.stopSeconds}, current: ${currentMcState.stopSeconds}`);

      // TODO: when the total is increasing after stopped, send signal to the client

      if (batch.toBeStopped) {
        await this.oeeBatchService.update1(batch.id, {
          toBeStopped: false,
          batchStoppedDate: dayjs().startOf('s').toDate(),
        });
      }

      // update current status
      const tagMcStateData: OeeTagMCStatus = tagMcState.data;

      if (batch.batchStoppedDate || batch.toBeStopped) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_ENDED;
      } else if (activePD && !activePD.expiredAt) {
        if (activePD.type === PLANNED_DOWNTIME_TYPE_PLANNED) {
          currentMcState.batchStatus = OEE_BATCH_STATUS_PLANNED;
        } else if (activePD.type === PLANNED_DOWNTIME_TYPE_MC_SETUP) {
          currentMcState.batchStatus = OEE_BATCH_STATUS_MC_SETUP;
        }
      } else if (currentMcState.stopSeconds >= batch.breakdownSeconds) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_BREAKDOWN;
      } else if (currentTagMcState.read === tagMcStateData.standby) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_STANDBY;
      } else if (currentTagMcState.read === tagMcStateData.running) {
        currentMcState.batchStatus = OEE_BATCH_STATUS_RUNNING;
      }

      this.logger.log(
        `batch status - previous: ${previousMcState.batchStatus}, current: ${currentMcState.batchStatus}`,
      );

      // send batch status
      const tagOutBatchStatus = this.findOeeTag(OEE_TAG_OUT_BATCH_STATUS, oeeTags);
      if (tagOutBatchStatus !== null) {
        const tagBatchStatusData: OeeTagOutBatchStatus = tagOutBatchStatus.data;
        const outVal = this.getTagBatchStatus(currentMcState.batchStatus, activePD, tagBatchStatusData);
        if (outVal !== '') {
          this.socketService.socket.to(`site_${batch.siteId}`).emit(`tag_out`, {
            deviceId: tagOutBatchStatus.deviceId,
            tagId: tagOutBatchStatus.tagId,
            value: outVal,
          });
        }
      }

      await this.eventEmitter.emitAsync('batch-mc-state.update', {
        siteId: batch.siteId,
        batchId: batch.id,
        currentMcState: currentMcState,
      });

      await this.eventEmitter.emitAsync('batch-timeline.update', {
        siteId: batch.siteId,
        batchId: batch.id,
        previousMcState: previousMcState,
        currentMcState: currentMcState,
      });

      // check A or P
      if (
        currentMcState.stopSeconds === 0 &&
        previousMcState.stopSeconds > 0 &&
        previousMcState.stopSeconds > batch.standardSpeedSeconds
      ) {
        if (previousMcState.stopSeconds >= batch.breakdownSeconds) {
          // A happens
          await this.processA(batch, previousMcState, allReads, readTimestamp);
        } else {
          // P happens
          await this.processP(batch, previousMcState, allReads, readTimestamp);
        }
      }

      // check Q
      if (currentMcState.totalNg > previousMcState.totalNg) {
        await this.processQ(batch, allReads);
      }

      await this.handleBatchOeeCalculate(batch.id, previousMcState, currentMcState, oeeTags);
    } catch (error) {
      this.logger.error('exception', error);
    }
  }

  getTagBatchStatus(batchStatus: string, activePD: OeeBatchPlannedDowntimeEntity, data: OeeTagOutBatchStatus): string {
    switch (batchStatus) {
      case OEE_BATCH_STATUS_RUNNING:
        return data.running;

      case OEE_BATCH_STATUS_STANDBY:
        return data.standby;

      case OEE_BATCH_STATUS_BREAKDOWN:
        return data.breakdown;

      case OEE_BATCH_STATUS_PLANNED:
        if (activePD.timing === PLANNED_DOWNTIME_TIMING_AUTO) {
          return data.plannedDowntimeAuto;
        } else if (activePD.timing === PLANNED_DOWNTIME_TIMING_MANUAL) {
          return data.plannedDowntimeManual;
        }
        return '';

      case OEE_BATCH_STATUS_MC_SETUP:
        return data.mcSetup;

      default:
        return '';
    }
  }

  sendTagOut(key: string, outVal: string, siteId: number, oeeTags: OeeTag[]): void {
    const tagOut = this.findOeeTag(key, oeeTags);
    if (tagOut !== null) {
      this.socketService.socket.to(`site_${siteId}`).emit(`tag_out`, {
        deviceId: tagOut.deviceId,
        tagId: tagOut.tagId,
        value: outVal,
      });
    }
  }

  async handleBatchOeeCalculate(
    batchId: number,
    previousMcState: OeeBatchMcState,
    currentMcState: OeeBatchMcState,
    oeeTags: OeeTag[],
  ) {
    try {
      const batch = await this.oeeBatchService.findById(batchId);
      const { batchStartedDate, standardSpeedSeconds, oeeStats, breakdownSeconds, plannedQuantity } = batch;
      const { total, totalNg, stopSeconds, timestamp } = currentMcState;
      const { total: previousTotal } = previousMcState;
      const readTimestamp = new Date(timestamp);
      const { totalManualDefects } = oeeStats;

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
      const currentPPercent = total === 0 ? 1 : (standardSpeedSeconds * total) / operatingSeconds;

      const usePreviousP = total - previousTotal === 0 && pStopSeconds === 0 && aStopSeconds === 0;
      const pPercent = usePreviousP ? oeeStats.pPercent / 100 : currentPPercent;

      // calculate Q
      const totalAllDefects = totalNg + totalManualDefects;
      const sumManual = qParams.reduce((acc, x) => acc + x.manualAmount, 0);
      const totalOtherDefects = totalManualDefects - sumManual;
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

        target,
        efficiency: efficiency * 100,
        pStopSeconds,
      };

      // this.logger.log('calculated oee:', currentStats);

      await this.oeeBatchService.update1(batch.id, { oeeStats: currentStats });

      // const tempTime = dayjs(readTimestamp);
      // if (tempTime.second() % 5 === 0 || batchStatus === OEE_BATCH_STATUS_ENDED) {
      await this.oeeBatchService.saveBatchStats(batch.oeeId, batch.product.id, batch.id, oeeStats, readTimestamp);
      // await this.analyticService.saveOeeStats(
      //   batch.siteId,
      //   batch.oeeId,
      //   batch.product.id,
      //   batch.id,
      //   oeeStats,
      //   batch.standardSpeedSeconds,
      //   dayjs().startOf('s').toDate(),
      // );
      await this.oeeBatchService.createBatchLog(batch.id);
      // }

      await this.eventEmitter.emitAsync('analytic-oee.update', {
        batchId: batch.id,
        oeeStats: currentStats,
      });

      // send to socket
      this.socketService.socket.to(`site_${batch.siteId}`).emit(`stats_${batchId}.updated`, currentStats);

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
      this.sendTagOut(OEE_TAG_OUT_TOTAL_NG, currentStats.totalCount.toString(), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_CYCLE_TIME, standardSpeedSeconds.toString(), batch.siteId, oeeTags);
      this.sendTagOut(OEE_TAG_OUT_PLANNED_QUANTITY, plannedQuantity.toString(), batch.siteId, oeeTags);

      // notify
      await this.notifyLow(batch.siteId, batch.oeeId, oeeStats, currentStats);
    } catch (error) {
      this.logger.log('exception', error);
    }
  }

  private getPercentSettings(settings: PercentSetting[]): { oeeLow: number; aLow: number; pLow: number; qLow: number } {
    return {
      oeeLow: settings.filter((item) => item.type === OEE_TYPE_OEE)[0].settings.low,
      aLow: settings.filter((item) => item.type === OEE_TYPE_A)[0].settings.low,
      pLow: settings.filter((item) => item.type === OEE_TYPE_P)[0].settings.low,
      qLow: settings.filter((item) => item.type === OEE_TYPE_Q)[0].settings.low,
    };
  }

  private async notifyLow(
    siteId: number,
    oeeId: number,
    previousStatus: OeeStats,
    currentStatus: OeeStats,
  ): Promise<void> {
    const oee = await this.oeeService.findById(oeeId);
    const site = await this.siteService.findById(oee.siteId);
    const percentSettings: { oeeLow: number; aLow: number; pLow: number; qLow: number } = this.getPercentSettings(
      oee.useSitePercentSettings ? site.defaultPercentSettings : oee.percentSettings,
    );

    if (
      (previousStatus.oeePercent > percentSettings.oeeLow || previousStatus.qPercent > currentStatus.qPercent) &&
      currentStatus.oeePercent < percentSettings.oeeLow
    ) {
      await this.notificationService.notifyOeeLow(siteId, oeeId, previousStatus.oeePercent, currentStatus.oeePercent);
    }

    if (
      (previousStatus.aPercent > percentSettings.aLow || previousStatus.aPercent > currentStatus.aPercent) &&
      currentStatus.aPercent < percentSettings.aLow
    ) {
      await this.notificationService.notifyALow(siteId, oeeId, previousStatus.aPercent, currentStatus.aPercent);
    }

    if (
      (previousStatus.pPercent > percentSettings.pLow || previousStatus.pPercent > currentStatus.pPercent) &&
      currentStatus.pPercent < percentSettings.pLow
    ) {
      await this.notificationService.notifyPLow(siteId, oeeId, previousStatus.pPercent, currentStatus.pPercent);
    }

    if (
      (previousStatus.qPercent > percentSettings.qLow || previousStatus.qPercent > currentStatus.qPercent) &&
      currentStatus.qPercent < percentSettings.qLow
    ) {
      await this.notificationService.notifyQLow(siteId, oeeId, previousStatus.qPercent, currentStatus.qPercent);
    }
  }

  private async processA(
    batch: OeeBatchEntity,
    previousMcState: OeeBatchMcState,
    reads: ReadItem[],
    readTimestamp: Date,
  ): Promise<void> {
    this.logger.log(`A - breakdown: ${previousMcState.stopSeconds}, (settings: ${batch.breakdownSeconds})`);

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
      this.notificationService.notifyAParam(
        batch.siteId,
        batch.oeeId,
        batch.id,
        updatingA.tagId,
        readTimestamp,
        previousMcState.stopSeconds,
      ),
    ]);

    await this.eventEmitter.emitAsync('batch-a-params.updated', {
      batchId: batch.id,
      createLog: false,
    });

    const analyticAParamsUpdateEvent: AnalyticAParamUpdateEvent = {
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      params: [
        {
          tagId: updatingA.tagId,
          seconds: updatingA.seconds,
          machineId: updatingA.machineId,
          machineParameterId: updatingA.machineParameterId,
        },
      ],
    };
    await this.eventEmitter.emitAsync('analytic-a-params.update', analyticAParamsUpdateEvent);
  }

  private async processP(
    batch: OeeBatchEntity,
    previousMcState: OeeBatchMcState,
    reads: ReadItem[],
    readTimestamp: Date,
  ): Promise<void> {
    if (previousMcState.stopSeconds >= batch.minorStopSeconds) {
      // minor stop
      this.logger.log(`P - minor stop: ${previousMcState.stopSeconds}, (settings: ${batch.minorStopSeconds})`);

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

      await this.eventEmitter.emitAsync('batch-p-params.updated', {
        batchId: batch.id,
        createLog: false,
      });

      const analyticPParamsUpdateEvent: AnalyticPParamUpdateEvent = {
        siteId,
        oeeId,
        productId: product.id,
        oeeBatchId: batch.id,
        params: [
          {
            tagId: updatingP.tagId,
            seconds: updatingP.seconds,
            machineId: updatingP.machineId,
            machineParameterId: updatingP.machineParameterId,
          },
        ],
      };
      await this.eventEmitter.emitAsync('analytic-p-params.update', analyticPParamsUpdateEvent);
    } else {
      // speed loss
      this.logger.log(`P - speed loss: ${previousMcState.stopSeconds}`);

      await this.oeeBatchService.createBatchP({
        isSpeedLoss: true,
        oeeBatchId: batch.id,
        timestamp: readTimestamp,
        seconds: previousMcState.stopSeconds,
      });
    }
  }

  private async processQ(batch: OeeBatchEntity, reads: ReadItem[]): Promise<void> {
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
    const analyticQParamsUpdateEvent: AnalyticQParamUpdateEvent = {
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      params: [
        {
          autoAmount: updatingParam.autoAmount - currentParam.autoAmount,
          manualAmount: 0,
          tagId: currentParam.tagId,
          machineId: currentParam.machineId,
          machineParameterId: currentParam.machineParameterId,
        },
      ],
    };
    await this.eventEmitter.emitAsync('analytic-q-params.update', analyticQParamsUpdateEvent);

    this.logger.log(
      `Q - Id: ${currentParam.id} (${currentParam.tagId}) - previous: ${currentParam.autoAmount}, current: ${updatingParam.autoAmount}`,
    );

    await Promise.all([
      this.oeeBatchService.updateBatchQ(updatingParam),
      this.notificationService.notifyQParam(
        batch.siteId,
        batch.oeeId,
        batch.id,
        currentParam.tagId,
        currentParam.autoAmount,
        updatingParam.autoAmount,
      ),
    ]);

    await this.eventEmitter.emitAsync('batch-q-params.updated', {
      batchId: batch.id,
      createLog: false,
    });

    // for (const updatingQ of updatingQs) {
    //   const { param, currentRead } = updatingQ;
    //
    //   this.logger.log(`Q - Id: ${param.id} (${param.tagId}) - previous: ${param.autoAmount}, current: ${currentRead}`);
    //
    //   await Promise.all([
    //     this.oeeBatchService.updateBatchQ({
    //       id: param.id,
    //       tagId: param.tagId,
    //       autoAmount: currentRead,
    //       totalAmount: param.manualAmount + currentRead,
    //     }),
    //     this.notificationService.notifyQParam(
    //       batch.siteId,
    //       batch.oeeId,
    //       batch.id,
    //       param.tagId,
    //       param.autoAmount,
    //       currentRead,
    //     ),
    //   ]);
    //
    //   const analyticQParamsUpdateEvent: AnalyticQParamUpdateEvent = {
    //     siteId,
    //     oeeId,
    //     productId: product.id,
    //     oeeBatchId: batch.id,
    //     param: {
    //       autoAmount: currentRead,
    //       manualAmount: currentRead,
    //       tagId: updatingQ.tagId,
    //       machineId: updatingQ.machineId,
    //       machineParameterId: updatingQ.machineParameterId,
    //     },
    //   };
    //   await this.eventEmitter.emitAsync('analytic-q-params.update', analyticQParamsUpdateEvent);
    // }
  }

  // async handleBatchOeeCalculate(event: BatchOeeCalculateEvent) {
  //   const { batchId, currentMcState } = event;
  //
  //   try {
  //     const batch = await this.oeeBatchService.findById(batchId);
  //     const { batchStartedDate, standardSpeedSeconds, oeeStats, minorStopSeconds, breakdownSeconds } = batch;
  //     const { batchStatus, total, totalNg, stopSeconds, timestamp } = currentMcState;
  //     const readTimestamp = new Date(timestamp);
  //     const { totalManualDefects } = oeeStats;
  //
  //     const childrenResult = await Promise.all([
  //       this.oeeBatchService.findBatchAsById(batch.id),
  //       this.oeeBatchService.findBatchPsById(batch.id),
  //       this.oeeBatchService.findBatchQsById(batch.id),
  //       this.oeeBatchService.findBatchPlannedDowntimesById(batch.id),
  //     ]);
  //
  //     const aParams = childrenResult[0];
  //     const pParams = childrenResult[1];
  //     const qParams = childrenResult[2];
  //     const plannedDowntimes = childrenResult[3] || [];
  //
  //     const startTime = dayjs(batchStartedDate);
  //     const endTime = dayjs().startOf('s');
  //
  //     const runningSeconds = endTime.diff(startTime, 's');
  //     const plannedDowntimeSeconds = plannedDowntimes
  //       .filter((item) => item.type === PLANNED_DOWNTIME_TYPE_PLANNED)
  //       .reduce((acc, item) => {
  //         const endedAt = item.expiredAt ? item.expiredAt : endTime;
  //         return acc + dayjs(endedAt).diff(item.createdAt, 's');
  //       }, 0);
  //
  //     const aStopSeconds = 0; //stopSeconds >= breakdownSeconds ? stopSeconds : 0;
  //     const totalBreakdownCount = aParams.length;
  //     const totalBreakdownSeconds = aParams.reduce((acc, x) => acc + x.seconds, 0) + aStopSeconds;
  //     const runningAfterPlannedSeconds = runningSeconds - plannedDowntimeSeconds;
  //     const actualRunningSeconds = runningAfterPlannedSeconds - totalBreakdownSeconds;
  //
  //     // calculate A
  //     const aPercent = actualRunningSeconds / runningAfterPlannedSeconds;
  //
  //     // calculate P
  //     const speedLossList = pParams.filter((x) => x.isSpeedLoss);
  //     const minorStopList = pParams.filter((x) => !x.isSpeedLoss);
  //     const totalSpeedLossCount = speedLossList.length;
  //     const totalSpeedLossSeconds = speedLossList.reduce((acc, x) => acc + x.seconds, 0);
  //     const totalMinorStopCount = minorStopList.length;
  //     const totalMinorStopSeconds = minorStopList.reduce((acc, x) => acc + x.seconds, 0);
  //     const pStopSeconds = 0; //stopSeconds >= standardSpeedSeconds && stopSeconds <= minorStopSeconds ? stopSeconds : 0;
  //     const pPercent = total === 0 ? 1 : (standardSpeedSeconds * total) / (actualRunningSeconds - pStopSeconds);
  //
  //     // calculate Q
  //     const totalAllDefects = totalNg + totalManualDefects;
  //     const sumManual = qParams.reduce((acc, x) => acc + x.manualAmount, 0);
  //     const totalOtherDefects = totalManualDefects - sumManual;
  //     const qPercent = total === 0 ? 1 : (total - totalAllDefects) / total;
  //
  //     // calculate OEE
  //     const oeePercent = aPercent * pPercent * qPercent;
  //
  //     const target = actualRunningSeconds / standardSpeedSeconds;
  //     const efficiency = ((total - totalNg + totalManualDefects) / target) * 100;
  //     const totalStopSeconds = totalBreakdownSeconds + totalSpeedLossSeconds + totalMinorStopSeconds;
  //     // M/C setup is already INCLUDED in Breakdown - only show in the client
  //     const machineSetupSeconds = plannedDowntimes
  //       .filter((item) => item.type === PLANNED_DOWNTIME_TYPE_MC_SETUP)
  //       .reduce((acc, item) => {
  //         const endedAt = item.expiredAt ? item.expiredAt : endTime;
  //         return acc + dayjs(endedAt).diff(item.createdAt, 's');
  //       }, 0);
  //
  //     const currentStats = {
  //       aPercent: aPercent * 100,
  //       pPercent: pPercent * 100,
  //       qPercent: qPercent * 100,
  //       oeePercent: oeePercent * 100,
  //       // A & P
  //       runningSeconds,
  //       actualRunningSeconds,
  //       plannedDowntimeSeconds,
  //       machineSetupSeconds,
  //       totalStopSeconds,
  //       totalBreakdownCount,
  //       totalBreakdownSeconds,
  //       totalSpeedLossCount,
  //       totalSpeedLossSeconds,
  //       totalMinorStopCount,
  //       totalMinorStopSeconds,
  //       // Q
  //       totalCount: total,
  //       totalAutoDefects: totalNg,
  //       totalManualDefects,
  //       totalOtherDefects,
  //       target,
  //       efficiency,
  //       // FYI
  //       aStopSeconds,
  //       pStopSeconds,
  //     };
  //
  //     this.logger.log('calculated oee:', currentStats);
  //
  //     await this.oeeBatchService.update1(batch.id, { oeeStats: currentStats });
  //
  //     // const tempTime = dayjs(readTimestamp);
  //     // if (tempTime.second() % 5 === 0 || batchStatus === OEE_BATCH_STATUS_ENDED) {
  //     await this.oeeBatchService.saveBatchStats(batch.oeeId, batch.product.id, batch.id, oeeStats, readTimestamp);
  //     // await this.analyticService.saveOeeStats(
  //     //   batch.siteId,
  //     //   batch.oeeId,
  //     //   batch.product.id,
  //     //   batch.id,
  //     //   oeeStats,
  //     //   batch.standardSpeedSeconds,
  //     //   dayjs().startOf('s').toDate(),
  //     // );
  //     await this.oeeBatchService.createBatchLog(batch.id);
  //     // }
  //
  //     // send to socket
  //     this.socketService.socket.to(`site_${batch.siteId}`).emit(`stats_${batchId}.updated`, currentStats);
  //
  //     // notify
  //     // this.notifyLow(batch.siteId, batch.oeeId, batch.oeeStatus, currentStatus),
  //   } catch (error) {
  //     this.logger.log('exception', error);
  //   }
  // }

  // async private  notifyLow(
  //   siteId: number,
  //   oeeId: number,
  //   previousStatus: OeeStats,
  //   currentStatus: OeeStats,
  // ): Promise<void> {
  //   const oee = await this.oeeService.findById(oeeId);
  //   const site = await this.siteService.findById(oee.siteId);
  //   const percentSettings: { oeeLow: number; aLow: number; pLow: number; qLow: number } = this.getPercentSettings(
  //     oee.useSitePercentSettings ? site.defaultPercentSettings : oee.percentSettings,
  //   );
  //
  //   if (previousStatus.oeePercent > percentSettings.oeeLow && currentStatus.oeePercent < percentSettings.oeeLow) {
  //     await this.notificationService.notifyOeeLow(siteId, oeeId, previousStatus.oeePercent, currentStatus.oeePercent);
  //   }
  //
  //   if (previousStatus.aPercent > percentSettings.aLow && currentStatus.aPercent < percentSettings.aLow) {
  //     await this.notificationService.notifyALow(siteId, oeeId, previousStatus.aPercent, currentStatus.aPercent);
  //   }
  //
  //   if (previousStatus.pPercent > percentSettings.pLow && currentStatus.pPercent < percentSettings.pLow) {
  //     await this.notificationService.notifyPLow(siteId, oeeId, previousStatus.pPercent, currentStatus.pPercent);
  //   }
  //
  //   if (previousStatus.qPercent > percentSettings.qLow && currentStatus.qPercent < percentSettings.qLow) {
  //     await this.notificationService.notifyQLow(siteId, oeeId, previousStatus.qPercent, currentStatus.qPercent);
  //   }
  // }
  //
  // private getPercentSettings(settings: PercentSetting[]): { oeeLow: number; aLow: number; pLow: number; qLow: number } {
  //   return {
  //     oeeLow: settings.filter((item) => item.type === OEE_TYPE_OEE)[0].settings.low,
  //     aLow: settings.filter((item) => item.type === OEE_TYPE_A)[0].settings.low,
  //     pLow: settings.filter((item) => item.type === OEE_TYPE_P)[0].settings.low,
  //     qLow: settings.filter((item) => item.type === OEE_TYPE_Q)[0].settings.low,
  //   };
  // }
}
