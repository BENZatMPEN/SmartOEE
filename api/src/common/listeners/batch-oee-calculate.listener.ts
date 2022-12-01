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
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
  OEE_TYPE_A,
  OEE_TYPE_OEE,
  OEE_TYPE_P,
  OEE_TYPE_Q,
  PLANNED_DOWNTIME_TIMING_AUTO,
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
import { Read } from '../type/read';
import { OeeTagMCStatus } from '../type/oee-tag';
import { OeeBatchMcState } from '../type/oee-status';
import { OeeBatch } from '../entities/oee-batch';

@Injectable()
export class BatchOeeCalculateListener {
  private readonly logger = new Logger(BatchOeeCalculateListener.name);

  constructor(
    private readonly siteService: SiteService,
    private readonly oeeService: OeeService,
    private readonly oeeBatchService: OeeBatchService,
    // private readonly analyticService: AnalyticService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('batch-oee.calculate')
  private async processRead(event: BatchOeeCalculateEvent): Promise<void> {
    try {
      const { batchId, tagRead } = event;
      const readTimestamp = new Date(tagRead.timestamp);
      const batch = await this.oeeBatchService.findById(batchId);
      const oee = await this.oeeService.findById(batch.oeeId);
      const oeeTags = oee.tags || [];
      const tagMcStateIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_MC_STATE && item.tagId);
      const tagTotalIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_TOTAL && item.tagId);
      const tagTotalNgIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_TOTAL_NG && item.tagId);
      if (tagMcStateIdx < 0 || tagTotalIdx < 0 || tagTotalNgIdx < 0) {
        this.logger.log('OEE tags are required.');
        return;
      }

      const tagMcState = oeeTags[tagMcStateIdx];
      const tagMcStateData = tagMcState.data as OeeTagMCStatus;
      const tagTotal = oeeTags[tagTotalIdx];
      const tagTotalNg = oeeTags[tagTotalNgIdx];

      const currentTagMcState = tagRead.reads.filter((read) => read.tagId === tagMcState.tagId)[0];
      const currentTagTotal = tagRead.reads.filter((read) => read.tagId === tagTotal.tagId)[0];
      const currentTagTotalNg = tagRead.reads.filter((read) => read.tagId === tagTotalNg.tagId)[0];

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
          await this.processA(batch, previousMcState, tagRead, readTimestamp);
        } else {
          // P happens
          await this.processP(batch, previousMcState, tagRead, readTimestamp);
        }
      }

      // check Q
      if (currentMcState.totalNg > previousMcState.totalNg) {
        await this.processQ(batch, tagRead);
      }

      await this.handleBatchOeeCalculate(batch.id, previousMcState, currentMcState);
    } catch (error) {
      this.logger.error('exception', error);
    }
  }

  async handleBatchOeeCalculate(batchId: number, previousMcState: OeeBatchMcState, currentMcState: OeeBatchMcState) {
    try {
      const batch = await this.oeeBatchService.findById(batchId);
      const { batchStartedDate, standardSpeedSeconds, oeeStats, breakdownSeconds } = batch;
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

      // send to socket
      this.socketService.socket.to(`site_${batch.siteId}`).emit(`stats_${batchId}.updated`, currentStats);

      // notify
      // this.notifyLow(batch.siteId, batch.oeeId, batch.oeeStatus, currentStatus),
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

    if (previousStatus.oeePercent > percentSettings.oeeLow && currentStatus.oeePercent < percentSettings.oeeLow) {
      await this.notificationService.notifyOeeLow(siteId, oeeId, previousStatus.oeePercent, currentStatus.oeePercent);
    }

    if (previousStatus.aPercent > percentSettings.aLow && currentStatus.aPercent < percentSettings.aLow) {
      await this.notificationService.notifyALow(siteId, oeeId, previousStatus.aPercent, currentStatus.aPercent);
    }

    if (previousStatus.pPercent > percentSettings.pLow && currentStatus.pPercent < percentSettings.pLow) {
      await this.notificationService.notifyPLow(siteId, oeeId, previousStatus.pPercent, currentStatus.pPercent);
    }

    if (previousStatus.qPercent > percentSettings.qLow && currentStatus.qPercent < percentSettings.qLow) {
      await this.notificationService.notifyQLow(siteId, oeeId, previousStatus.qPercent, currentStatus.qPercent);
    }
  }

  private async processA(
    batch: OeeBatch,
    previousMcState: OeeBatchMcState,
    tagRead: Read,
    readTimestamp: Date,
  ): Promise<void> {
    this.logger.log(`A - breakdown: ${previousMcState.stopSeconds}, (settings: ${batch.breakdownSeconds})`);

    const { machines } = batch;
    const mcParamAs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_A && param.tagId))
      .flat();
    const updatingAs = mcParamAs.reduce((acc, param) => {
      const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && read.read === param.value);
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

    if (updatingAs.length === 0) {
      updatingAs.push({
        oeeBatchId: batch.id,
        timestamp: readTimestamp,
        seconds: previousMcState.stopSeconds,
      });
    }

    for (const updatingA of updatingAs) {
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
    }

    await this.eventEmitter.emitAsync('batch-a-params.updated', {
      batchId: batch.id,
      createLog: false,
    });
  }

  private async processP(
    batch: OeeBatch,
    previousMcState: OeeBatchMcState,
    tagRead: Read,
    readTimestamp: Date,
  ): Promise<void> {
    if (previousMcState.stopSeconds >= batch.minorStopSeconds) {
      // minor stop
      this.logger.log(`P - minor stop: ${previousMcState.stopSeconds}, (settings: ${batch.minorStopSeconds})`);

      const { machines } = batch;
      const mcParamPs = machines
        .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_P && param.tagId))
        .flat();
      const updatingPs = mcParamPs.reduce((acc, param) => {
        const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && read.read === param.value);
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

      if (updatingPs.length === 0) {
        updatingPs.push({
          isSpeedLoss: false,
          oeeBatchId: batch.id,
          timestamp: readTimestamp,
          seconds: previousMcState.stopSeconds,
        });
      }

      for (const updatingP of updatingPs) {
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
      }

      await this.eventEmitter.emitAsync('batch-p-params.updated', {
        batchId: batch.id,
        createLog: false,
      });
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

  private async processQ(batch: OeeBatch, tagRead: Read): Promise<void> {
    const qParams = await this.oeeBatchService.findBatchQsById(batch.id);
    const updatingQs = qParams.reduce((acc, param) => {
      const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && Number(read.read) > param.autoAmount);
      if (idx < 0) {
        return acc;
      }

      acc.push({ param, currentRead: Number(tagRead.reads[idx].read) });
      return acc;
    }, []);

    for (const updatingQ of updatingQs) {
      const { param, currentRead } = updatingQ;

      this.logger.log(`Q - Id: ${param.id} (${param.tagId}) - previous: ${param.autoAmount}, current: ${currentRead}`);

      await Promise.all([
        this.oeeBatchService.updateBatchQ({
          id: param.id,
          tagId: param.tagId,
          autoAmount: currentRead,
          totalAmount: param.manualAmount + currentRead,
        }),
        this.notificationService.notifyQParam(
          batch.siteId,
          batch.oeeId,
          batch.id,
          param.tagId,
          param.autoAmount,
          currentRead,
        ),
      ]);
    }

    await this.eventEmitter.emitAsync('batch-q-params.updated', {
      batchId: batch.id,
      createLog: false,
    });
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
  //
  // private async notifyLow(
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
