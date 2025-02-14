import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BatchMcStateUpdateEvent, BatchParamsUpdatedEvent, BatchTimelineUpdateEvent } from '../events/batch.event';
import { OeeBatchService } from '../../oee-batch/oee-batch.service';
import { SocketService } from '../services/socket.service';
import dayjs from 'dayjs';
import { OeeStats } from '../type/oee-stats';
import { BatchAEvent } from '../events/batch-a.event';
import { BatchPEvent } from '../events/batch-p.event';

@Injectable()
export class BatchEventsListener {
  private readonly logger = new Logger(BatchEventsListener.name);

  constructor(
    private readonly oeeBatchService: OeeBatchService,
    private readonly socketService: SocketService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('batch-mc-state.update', { async: true })
  async handleMcStateUpdateEvent(event: BatchMcStateUpdateEvent) {
    const { batch, currentMcState } = event;
    const { batchStatus: currentStatus } = currentMcState;

    await this.oeeBatchService.update1(batch.id, {
      status: currentStatus,
      mcState: currentMcState,
    });

    this.socketService.socket.to(`site_${batch.siteId}`).emit(`mc-state_${batch.id}.changed`, {
      status: currentMcState.batchStatus,
      mcState: currentMcState,
    });
  }

  @OnEvent('batch-timeline.update', { async: true })
  async handleTimelineUpdateEvent(event: BatchTimelineUpdateEvent) {
    const { batch, previousMcState, currentMcState } = event;
    const { batchStatus: currentStatus } = currentMcState;
    const { batchStatus: previousStatus } = previousMcState;

    const timeline = await this.oeeBatchService.findBatchLatestTimeline(batch.id);

    if (!timeline || previousStatus !== currentStatus) {
      await this.oeeBatchService.createBatchTimeline(batch, currentStatus, currentMcState.timestamp);
    } else {
      await this.oeeBatchService.updateBatchTimeline(timeline.id, currentMcState.timestamp);
    }

    const timelines = await this.oeeBatchService.findBatchTimelinesByBatchId(batch.id);
    this.socketService.socket.to(`site_${batch.siteId}`).emit(`batch-timeline_${batch.id}.updated`, timelines);
  }

  @OnEvent('batch-a-params.updated', { async: true })
  async handleAParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

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

  @OnEvent('batch-p-params.updated', { async: true })
  async handlePParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

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

  @OnEvent('batch-q-params.updated', { async: true })
  async handleQParamsUpdatedEvent(event: BatchParamsUpdatedEvent) {
    const { batchId } = event;

    const batch = await this.oeeBatchService.findById(batchId);
    const qParams = await this.oeeBatchService.findBatchQsById(batch.id);

    const { siteId, oeeStats } = batch;
    const { aPercent, pPercent, totalCount, totalAutoDefects, totalManualDefects, totalManualGrams } = oeeStats;

    // calculate Q
    const totalAllDefects = totalAutoDefects + totalManualDefects;
    const sumManual = qParams.reduce((acc, x) => acc + x.manualAmount, 0);
    const totalOtherDefects = totalManualDefects - (sumManual + totalManualGrams);
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
