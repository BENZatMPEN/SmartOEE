import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  BatchMcStateUpdateEvent,
  BatchParamsUpdatedEvent,
  BatchPlannedDowntimeUpdateEvent,
  BatchTimelineUpdateEvent,
} from '../events/batch.event';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SocketService } from '../services/socket.service';
import { PLANNED_DOWNTIME_TIMING_AUTO, PLANNED_DOWNTIME_TIMING_TIMER } from '../constant';
import * as dayjs from 'dayjs';
import { OeeStats } from '../type/oee-stats';
import { AnalyticService } from '../../analytic/analytic.service';

@Injectable()
export class BatchEventsListener {
  private readonly logger = new Logger(BatchEventsListener.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    // private readonly analyticService: AnalyticService,
    private readonly socketService: SocketService,
  ) {}

  @OnEvent('batch-mc-state.update')
  async handleMcStateUpdateEvent(event: BatchMcStateUpdateEvent) {
    const { siteId, batchId, currentMcState } = event;
    const { batchStatus: currentStatus } = currentMcState;

    await this.oeeBatchService.update1(batchId, {
      status: currentStatus,
      mcState: currentMcState,
    });

    this.socketService.socket.to(`site_${siteId}`).emit(`mc-state_${batchId}.changed`, {
      status: currentMcState.batchStatus,
      mcState: currentMcState,
    });
  }

  @OnEvent('batch-timeline.update')
  async handleTimelineUpdateEvent(event: BatchTimelineUpdateEvent) {
    const { siteId, batchId, previousMcState, currentMcState } = event;
    const { batchStatus: currentStatus, timestamp: currentTimestamp } = currentMcState;
    const { batchStatus: previousStatus } = previousMcState;

    const timeline = await this.oeeBatchService.findBatchLatestTimeline(batchId);
    if (!timeline || previousStatus !== currentStatus) {
      await this.oeeBatchService.createBatchTimeline(batchId, currentStatus, new Date(currentTimestamp));
    } else {
      await this.oeeBatchService.updateBatchTimeline(timeline.id, new Date(currentTimestamp));
    }

    const timelines = await this.oeeBatchService.findBatchTimelinesByBatchId(batchId);
    this.socketService.socket.to(`site_${siteId}`).emit(`batch-timeline_${batchId}.updated`, timelines);
  }

  // @OnEvent('batch-planned-downtime.update')
  // async handleBatchPlannedDowntimeUpdateEvent(event: BatchPlannedDowntimeUpdateEvent) {
  //   const { plannedDowntime: activePlannedDowntime, previousTotal, currentTotal, timestamp } = event;
  //   this.logger.log(`planned downtime: ${activePlannedDowntime.type} timing: ${activePlannedDowntime.timing}`);
  //
  //   let expired = false;
  //
  //   if (activePlannedDowntime.toBeExpired) {
  //     expired = true;
  //   } else {
  //     if (activePlannedDowntime.timing === PLANNED_DOWNTIME_TIMING_AUTO && currentTotal > previousTotal) {
  //       this.logger.log('planned downtime expired - auto');
  //       expired = true;
  //     } else if (activePlannedDowntime.timing === PLANNED_DOWNTIME_TIMING_TIMER) {
  //       const expirationDate = dayjs(activePlannedDowntime.createdAt).add(activePlannedDowntime.seconds, 's');
  //       const timeCounter = expirationDate.diff(dayjs(), 's');
  //       this.logger.log(`planned downtime - timer: ${timeCounter}`);
  //
  //       if (timeCounter <= 0) {
  //         this.logger.log('planned downtime expired - timer');
  //         expired = true;
  //       }
  //     }
  //   }
  //
  //   if (expired) {
  //     await this.oeeBatchService.expireActivePlannedDowntime(activePlannedDowntime);
  //     activePlannedDowntime.expiredAt = new Date(timestamp);
  //   }
  // }

  @OnEvent('batch-a-params.updated')
  async handleAParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

    this.logger.log('a params updated-------------------------');

    const batch = await this.oeeBatchService.findById(batchId);
    const { siteId } = batch;
    const aParams = await this.oeeBatchService.findBatchAsById(batchId);

    if (event.createLog) {
      await this.oeeBatchService.createBatchLog(batchId);
    }

    this.socketService.socket.to(`site_${siteId}`).emit(`a-params_${batchId}.updated`, aParams);

    const paretoData = await this.oeeBatchService.calculateBatchParetoA(batchId);
    this.socketService.socket.to(`site_${siteId}`).emit(`a-pareto_${batchId}.updated`, paretoData);
  }

  @OnEvent('batch-p-params.updated')
  async handlePParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

    this.logger.log('p params updated-------------------------');

    const batch = await this.oeeBatchService.findById(batchId);
    const { siteId } = batch;
    const pParams = await this.oeeBatchService.findBatchPsByIdAndMinorStop(batchId);

    if (event.createLog) {
      await this.oeeBatchService.createBatchLog(batchId);
    }

    this.socketService.socket.to(`site_${siteId}`).emit(`p-params_${batchId}.updated`, pParams);

    const paretoData = await this.oeeBatchService.calculateBatchParetoP(batchId);
    this.socketService.socket.to(`site_${siteId}`).emit(`p-pareto_${batchId}.updated`, paretoData);
  }

  @OnEvent('batch-q-params.updated')
  async handleQParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

    this.logger.log('q params updated-------------------------');

    const batch = await this.oeeBatchService.findById(batchId);
    const qParams = await this.oeeBatchService.findBatchQsById(batch.id);

    const { siteId, oeeStats } = batch;
    const { aPercent, pPercent, totalCount, totalAutoDefects, totalManualDefects } = oeeStats;

    // calculate Q
    const totalAllDefects = totalAutoDefects + totalManualDefects;
    const sumManual = qParams.reduce((acc, x) => acc + x.manualAmount, 0);
    const totalOtherDefects = totalManualDefects - sumManual;
    const qPercent = totalCount === 0 ? 1 : (totalCount - totalAllDefects) / totalCount;

    // calculate OEE
    const oeePercent = (aPercent / 100) * (pPercent / 100) * qPercent;
    const currentStats: OeeStats = {
      ...oeeStats,
      qPercent: qPercent * 100,
      oeePercent: oeePercent * 100,
      totalAutoDefects,
      totalManualDefects,
      totalOtherDefects,
    };

    await this.oeeBatchService.update1(batch.id, { oeeStats: currentStats });
    await this.oeeBatchService.saveBatchStats(
      batch.oeeId,
      batch.product.id,
      batch.id,
      oeeStats,
      dayjs().startOf('s').toDate(),
    );
    // await this.analyticService.saveOeeStats(
    //   batch.siteId,
    //   batch.oeeId,
    //   batch.product.id,
    //   batch.id,
    //   oeeStats,
    //   batch.standardSpeedSeconds,
    //   dayjs().startOf('s').toDate(),
    // );

    if (event.createLog) {
      await this.oeeBatchService.createBatchLog(batch.id);
    }

    // send to socket
    this.socketService.socket.to(`site_${siteId}`).emit(`stats_${batch.id}.updated`, currentStats);
    this.socketService.socket.to(`site_${siteId}`).emit(`q-params_${batchId}.updated`, qParams);

    const paretoData = await this.oeeBatchService.calculateBatchParetoQ(batch.id);
    this.socketService.socket.to(`site_${siteId}`).emit(`q-pareto_${batchId}.updated`, paretoData);

    // notify
    // this.notifyLow(batch.siteId, batch.oeeId, batch.oeeStatus, currentStatus),
  }
}
