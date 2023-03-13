import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OeeService } from '../../oee/oee.service';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TagReadEntity } from '../entities/tag-read.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { NotificationService } from '../services/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SocketService } from '../services/socket.service';
import { SiteService } from '../../site/site.service';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

@Injectable()
export class TagReadJob {
  private readonly logger = new Logger(TagReadJob.name);

  constructor(
    private readonly siteService: SiteService,
    private readonly oeeService: OeeService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(TagReadEntity)
    private readonly tagReadRepository: Repository<TagReadEntity>,
  ) {}

  @Cron('0/1 * * * * *')
  async handleCron() {
    const siteIds = await this.oeeBatchService.findWorkingSiteIds();
    this.processSites(siteIds);
    // siteIds.forEach((siteId) => {
    //   (async () => {
    //     // always latest tag
    //     const tagRead = await this.tagReadRepository.findOneBy({ siteId });
    //     if (tagRead) {
    //       const batchIds = await this.oeeBatchService.findWorkingBatchIdsBySiteId(siteId);
    //       batchIds.forEach((batchId) => {
    //         (async () => {
    //           await this.eventEmitter.emitAsync('batch-oee.calculate', {
    //             batchId,
    //             tagRead: tagRead.read,
    //           });
    //           // await this.processRead(batchId, tagRead.read);
    //         })();
    //       });
    //     }
    //   })();
    // });
  }

  processSites(siteIds: number[]) {
    siteIds.forEach(async (siteId) => {
      // always latest tag
      const tagRead = await this.tagReadRepository.findOneBy({ siteId });
      if (tagRead) {
        const batchIds = await this.oeeBatchService.findWorkingBatchIdsBySiteId(siteId);
        this.processBatches(batchIds, tagRead);
        // batchIds.forEach((batchId) => {
        //   (async () => {
        //     await this.eventEmitter.emitAsync('batch-oee.calculate', {
        //       batchId,
        //       tagRead: tagRead.read,
        //     });
        //     // await this.processRead(batchId, tagRead.read);
        //   })();
        // });
      }
    });
  }

  processBatches(batchIds: number[], tagRead: TagReadEntity) {
    batchIds.forEach(async (batchId) => {
      this.eventEmitter.emit('batch-oee.calculate', {
        batchId,
        tagRead: tagRead.read,
      });
      // await this.processRead(batchId, tagRead.read);
    });
  }

  // private async processRead(batchId: number, tagRead: Read): Promise<void> {
  //   try {
  //     const readTimestamp = new Date(tagRead.timestamp);
  //     const batch = await this.oeeBatchService.findById(batchId);
  //     const oee = await this.oeeService.findById(batch.oeeId);
  //     const oeeTags = oee.tags || [];
  //     const tagMcStateIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_MC_STATE && item.tagId);
  //     const tagTotalIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_TOTAL && item.tagId);
  //     const tagTotalNgIdx = oeeTags.findIndex((item) => item.key === OEE_TAG_TOTAL_NG && item.tagId);
  //     if (tagMcStateIdx < 0 || tagTotalIdx < 0 || tagTotalNgIdx < 0) {
  //       this.logger.log('OEE tags are required.');
  //       return;
  //     }
  //
  //     const tagMcState = oeeTags[tagMcStateIdx];
  //     const tagMcStateData = tagMcState.data as OeeTagMCStatus;
  //     const tagTotal = oeeTags[tagTotalIdx];
  //     const tagTotalNg = oeeTags[tagTotalNgIdx];
  //
  //     const currentTagMcState = tagRead.reads.filter((read) => read.tagId === tagMcState.tagId)[0];
  //     const currentTagTotal = tagRead.reads.filter((read) => read.tagId === tagTotal.tagId)[0];
  //     const currentTagTotalNg = tagRead.reads.filter((read) => read.tagId === tagTotalNg.tagId)[0];
  //
  //     const previousMcState = batch.mcState;
  //     const currentMcState: OeeBatchMcState = {
  //       mcStatus: currentTagMcState.read,
  //       total: Number(currentTagTotal.read),
  //       totalNg: Number(currentTagTotalNg.read),
  //       stopSeconds: 0,
  //       stopTimestamp: null,
  //       batchStatus: OEE_BATCH_STATUS_UNKNOWN,
  //       timestamp: readTimestamp,
  //     };
  //
  //     if (!previousMcState.timestamp) {
  //       console.log('just started nothing to calculate');
  //       await this.eventEmitter.emitAsync('batch-mc-state.update', {
  //         siteId: batch.siteId,
  //         batchId: batch.id,
  //         currentMcState: currentMcState,
  //       });
  //       return;
  //     }
  //
  //     if (dayjs(currentMcState.timestamp).isSameOrBefore(previousMcState.timestamp)) {
  //       console.log('no new data');
  //       return;
  //     }
  //
  //     const activePlannedDowntime = await this.oeeBatchService.findActivePlannedDowntimeById(batch.id);
  //
  //     if (
  //       (!activePlannedDowntime && currentMcState.total === previousMcState.total) ||
  //       (activePlannedDowntime && activePlannedDowntime.type === PLANNED_DOWNTIME_TYPE_MC_SETUP)
  //     ) {
  //       const stopDate = previousMcState.stopTimestamp ? previousMcState.stopTimestamp : dayjs().startOf('s').toDate();
  //       currentMcState.stopTimestamp = stopDate;
  //       currentMcState.stopSeconds = dayjs().startOf('s').diff(stopDate, 's');
  //     } else {
  //       currentMcState.stopTimestamp = null;
  //       currentMcState.stopSeconds = 0;
  //     }
  //
  //     this.logger.log(
  //       `timestamp - previous: ${dayjs(previousMcState.timestamp).format('HH:mm:ss')}, current: ${dayjs(
  //         currentMcState.timestamp,
  //       ).format('HH:mm:ss')}`,
  //     );
  //     this.logger.log(`mc_status - previous: ${previousMcState.mcStatus}, current: ${currentMcState.mcStatus}`);
  //     this.logger.log(`total count - previous: ${previousMcState.total}, current: ${currentMcState.total}`);
  //     this.logger.log(`total defects - previous: ${previousMcState.totalNg}, current: ${currentMcState.totalNg}`);
  //     this.logger.log(`stop count - previous: ${previousMcState.stopSeconds}, current: ${currentMcState.stopSeconds}`);
  //     // this.logger.log(
  //     //   `stop time - previous: ${dayjs(previousMcState.stopTimestamp).format('HH:mm:ss')}, current: ${dayjs(
  //     //     currentMcState.stopTimestamp,
  //     //   ).format('HH:mm:ss')}`,
  //     // );
  //
  //     // TODO: when the total is increasing after stopped, send signal to the client
  //
  //     // update current status
  //     if (batch.batchStoppedDate) {
  //       currentMcState.batchStatus = OEE_BATCH_STATUS_ENDED;
  //     } else if (activePlannedDowntime) {
  //       if (activePlannedDowntime.type === PLANNED_DOWNTIME_TYPE_PLANNED) {
  //         currentMcState.batchStatus = OEE_BATCH_STATUS_PLANNED;
  //       } else if (activePlannedDowntime.type === PLANNED_DOWNTIME_TYPE_MC_SETUP) {
  //         currentMcState.batchStatus = OEE_BATCH_STATUS_MC_SETUP;
  //       }
  //     } else if (currentMcState.stopSeconds >= batch.breakdownSeconds) {
  //       currentMcState.batchStatus = OEE_BATCH_STATUS_BREAKDOWN;
  //     } else if (currentTagMcState.read === tagMcStateData.standby) {
  //       currentMcState.batchStatus = OEE_BATCH_STATUS_STANDBY;
  //     } else if (currentTagMcState.read === tagMcStateData.running) {
  //       currentMcState.batchStatus = OEE_BATCH_STATUS_RUNNING;
  //     }
  //
  //     this.logger.log(
  //       `batch status - previous: ${previousMcState.batchStatus}, current: ${currentMcState.batchStatus}`,
  //     );
  //
  //     await this.eventEmitter.emitAsync('batch-mc-state.update', {
  //       siteId: batch.siteId,
  //       batchId: batch.id,
  //       currentMcState: currentMcState,
  //     });
  //
  //     await this.eventEmitter.emitAsync('batch-timeline.update', {
  //       siteId: batch.siteId,
  //       batchId: batch.id,
  //       previousMcState: previousMcState,
  //       currentMcState: currentMcState,
  //     });
  //
  //     if (activePlannedDowntime) {
  //       await this.eventEmitter.emitAsync('batch-planned-downtime.update', {
  //         plannedDowntime: activePlannedDowntime,
  //         previousTotal: previousMcState.total,
  //         currentTotal: currentMcState.total,
  //         timestamp: readTimestamp,
  //       });
  //     }
  //
  //     if (batch.toBeStopped) {
  //       await this.oeeBatchService.update1(batch.id, {
  //         toBeStopped: false,
  //         batchStoppedDate: dayjs().startOf('s').toDate(),
  //       });
  //     }
  //
  //     // check A or P
  //     if (
  //       currentMcState.stopSeconds === 0 &&
  //       previousMcState.stopSeconds > 0 &&
  //       previousMcState.stopSeconds > batch.standardSpeedSeconds
  //     ) {
  //       if (previousMcState.stopSeconds >= batch.breakdownSeconds) {
  //         // A happens
  //         await this.processA(batch, previousMcState, tagRead, readTimestamp);
  //       } else {
  //         // P happens
  //         await this.processP(batch, previousMcState, tagRead, readTimestamp);
  //       }
  //     }
  //
  //     // check Q
  //     if (currentMcState.totalNg > previousMcState.totalNg) {
  //       await this.processQ(batch, tagRead);
  //     }
  //
  //     await this.handleBatchOeeCalculate(batch.id, currentMcState);
  //     // await this.eventEmitter.emitAsync('batch-oee.calculate', {
  //     //   batchId: batch.id,
  //     //   currentMcState,
  //     // });
  //   } catch (error) {
  //     this.logger.error('exception', error);
  //   }
  // }
  //
  // async handleBatchOeeCalculate(batchId: number, currentMcState: OeeBatchMcState) {
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
  //     const endTime = dayjs(readTimestamp);
  //
  //     const runningSeconds = endTime.diff(startTime, 's');
  //     const plannedDowntimeSeconds = plannedDowntimes
  //       .filter((item) => item.type === PLANNED_DOWNTIME_TYPE_PLANNED)
  //       .reduce((acc, item) => {
  //         const endedAt = item.expiredAt ? item.expiredAt : endTime;
  //         return acc + dayjs(endedAt).diff(item.createdAt, 's');
  //       }, 0);
  //
  //     const totalBreakdownCount = aParams.length;
  //     const totalBreakdownSeconds = aParams.reduce((acc, x) => acc + x.seconds, 0);
  //     const runningAfterPlannedSeconds = runningSeconds - plannedDowntimeSeconds;
  //     const actualRunningSeconds = runningAfterPlannedSeconds - totalBreakdownSeconds;
  //     const aStopSeconds = stopSeconds >= breakdownSeconds ? stopSeconds : 0;
  //
  //     // calculate A
  //     const aPercent = actualRunningSeconds / (runningAfterPlannedSeconds + aStopSeconds);
  //
  //     // calculate P
  //     const speedLossList = pParams.filter((x) => x.isSpeedLoss);
  //     const minorStopList = pParams.filter((x) => !x.isSpeedLoss);
  //     const totalSpeedLossCount = speedLossList.length;
  //     const totalSpeedLossSeconds = speedLossList.reduce((acc, x) => acc + x.seconds, 0);
  //     const totalMinorStopCount = minorStopList.length;
  //     const totalMinorStopSeconds = minorStopList.reduce((acc, x) => acc + x.seconds, 0);
  //     const pStopSeconds = stopSeconds >= standardSpeedSeconds && stopSeconds < breakdownSeconds ? stopSeconds : 0;
  //     const pPercent = total === 0 ? 1 : (standardSpeedSeconds * total) / (actualRunningSeconds + pStopSeconds);
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
  //     // this.logger.log('calculated oee:', currentStats);
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
  // private getPercentSettings(settings: PercentSetting[]): { oeeLow: number; aLow: number; pLow: number; qLow: number } {
  //   return {
  //     oeeLow: settings.filter((item) => item.type === OEE_TYPE_OEE)[0].settings.low,
  //     aLow: settings.filter((item) => item.type === OEE_TYPE_A)[0].settings.low,
  //     pLow: settings.filter((item) => item.type === OEE_TYPE_P)[0].settings.low,
  //     qLow: settings.filter((item) => item.type === OEE_TYPE_Q)[0].settings.low,
  //   };
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
  // private async processA(
  //   batch: OeeBatch,
  //   previousMcState: OeeBatchMcState,
  //   tagRead: Read,
  //   readTimestamp: Date,
  // ): Promise<void> {
  //   this.logger.log(`A - breakdown: ${previousMcState.stopSeconds}, (settings: ${batch.breakdownSeconds})`);
  //
  //   const { machines } = batch;
  //   const mcParamAs = machines
  //     .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_A && param.tagId))
  //     .flat();
  //   const updatingAs = mcParamAs.reduce((acc, param) => {
  //     const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && read.read === param.value);
  //     if (idx < 0) {
  //       return acc;
  //     }
  //
  //     acc.push({
  //       oeeBatchId: batch.id,
  //       tagId: param.tagId,
  //       machineId: param.machineId,
  //       machineParameterId: param.id,
  //       timestamp: readTimestamp,
  //       seconds: previousMcState.stopSeconds,
  //     });
  //     return acc;
  //   }, []);
  //
  //   if (updatingAs.length === 0) {
  //     updatingAs.push({
  //       oeeBatchId: batch.id,
  //       timestamp: readTimestamp,
  //       seconds: previousMcState.stopSeconds,
  //     });
  //   }
  //
  //   for (const updatingA of updatingAs) {
  //     await Promise.all([
  //       this.oeeBatchService.createBatchA(updatingA),
  //       this.notificationService.notifyAParam(
  //         batch.siteId,
  //         batch.oeeId,
  //         batch.id,
  //         updatingA.tagId,
  //         readTimestamp,
  //         previousMcState.stopSeconds,
  //       ),
  //     ]);
  //   }
  //
  //   await this.eventEmitter.emitAsync('batch-a-params.updated', {
  //     batchId: batch.id,
  //     createLog: false,
  //   });
  // }
  //
  // private async processP(
  //   batch: OeeBatch,
  //   previousMcState: OeeBatchMcState,
  //   tagRead: Read,
  //   readTimestamp: Date,
  // ): Promise<void> {
  //   if (previousMcState.stopSeconds >= batch.minorStopSeconds) {
  //     // minor stop
  //     this.logger.log(`P - minor stop: ${previousMcState.stopSeconds}, (settings: ${batch.minorStopSeconds})`);
  //
  //     const { machines } = batch;
  //     const mcParamPs = machines
  //       .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_P && param.tagId))
  //       .flat();
  //     const updatingPs = mcParamPs.reduce((acc, param) => {
  //       const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && read.read === param.value);
  //       if (idx < 0) {
  //         return acc;
  //       }
  //
  //       acc.push({
  //         isSpeedLoss: false,
  //         oeeBatchId: batch.id,
  //         tagId: param.tagId,
  //         machineId: param.machineId,
  //         machineParameterId: param.id,
  //         timestamp: readTimestamp,
  //         seconds: previousMcState.stopSeconds,
  //       });
  //       return acc;
  //     }, []);
  //
  //     if (updatingPs.length === 0) {
  //       updatingPs.push({
  //         isSpeedLoss: false,
  //         oeeBatchId: batch.id,
  //         timestamp: readTimestamp,
  //         seconds: previousMcState.stopSeconds,
  //       });
  //     }
  //
  //     for (const updatingP of updatingPs) {
  //       await Promise.all([
  //         this.oeeBatchService.createBatchP(updatingP),
  //         this.notificationService.notifyPParam(
  //           batch.siteId,
  //           batch.oeeId,
  //           batch.id,
  //           updatingP.tagId,
  //           readTimestamp,
  //           previousMcState.stopSeconds,
  //         ),
  //       ]);
  //     }
  //
  //     await this.eventEmitter.emitAsync('batch-p-params.updated', {
  //       batchId: batch.id,
  //       createLog: false,
  //     });
  //   } else {
  //     // speed loss
  //     this.logger.log(`P - speed loss: ${previousMcState.stopSeconds}`);
  //
  //     await this.oeeBatchService.createBatchP({
  //       isSpeedLoss: true,
  //       oeeBatchId: batch.id,
  //       timestamp: readTimestamp,
  //       seconds: previousMcState.stopSeconds,
  //     });
  //   }
  // }
  //
  // private async processQ(batch: OeeBatch, tagRead: Read): Promise<void> {
  //   const qParams = await this.oeeBatchService.findBatchQsById(batch.id);
  //   const updatingQs = qParams.reduce((acc, param) => {
  //     const idx = tagRead.reads.findIndex((read) => read.tagId === param.tagId && Number(read.read) > param.autoAmount);
  //     if (idx < 0) {
  //       return acc;
  //     }
  //
  //     acc.push({ param, currentRead: Number(tagRead.reads[idx].read) });
  //     return acc;
  //   }, []);
  //
  //   for (const updatingQ of updatingQs) {
  //     const { param, currentRead } = updatingQ;
  //
  //     this.logger.log(`Q - Id: ${param.id} (${param.tagId}) - previous: ${param.autoAmount}, current: ${currentRead}`);
  //
  //     await Promise.all([
  //       this.oeeBatchService.updateBatchQ({
  //         id: param.id,
  //         tagId: param.tagId,
  //         autoAmount: currentRead,
  //         totalAmount: param.manualAmount + currentRead,
  //       }),
  //       this.notificationService.notifyQParam(
  //         batch.siteId,
  //         batch.oeeId,
  //         batch.id,
  //         param.tagId,
  //         param.autoAmount,
  //         currentRead,
  //       ),
  //     ]);
  //   }
  //
  //   await this.eventEmitter.emitAsync('batch-q-params.updated', {
  //     batchId: batch.id,
  //     createLog: false,
  //   });
  // }
}
