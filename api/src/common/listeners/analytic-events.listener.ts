import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AnalyticAParamUpdateEvent,
  AnalyticOeeUpdateEvent,
  AnalyticPParamUpdateEvent,
  AnalyticQParamUpdateEvent,
} from '../events/analytic.event';
import * as dayjs from 'dayjs';
import { initialOeeBatchStats, OeeStats } from '../type/oee-stats';
import { AnalyticData } from '../type/analytic-data';
import { InjectRepository } from '@nestjs/typeorm';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { Repository } from 'typeorm';
import { OeeBatchStatsEntity } from '../entities/oee-batch-stats.entity';
import { AnalyticStatsEntity } from '../entities/analytic-stats.entity';
import { AnalyticStatsParamEntity } from '../entities/analytic-stats-param.entity';
import { OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P, OEE_PARAM_TYPE_Q } from '../constant';

@Injectable()
export class AnalyticEventsListener {
  private readonly logger = new Logger(AnalyticEventsListener.name);

  constructor(
    @InjectRepository(OeeBatchEntity)
    private readonly oeeBatchRepository: Repository<OeeBatchEntity>,
    @InjectRepository(OeeBatchStatsEntity)
    private readonly oeeBatchStatsRepository: Repository<OeeBatchStatsEntity>,
    @InjectRepository(AnalyticStatsEntity)
    private readonly analyticStatsRepository: Repository<AnalyticStatsEntity>,
    @InjectRepository(AnalyticStatsParamEntity)
    private readonly analyticStatsParamRepository: Repository<AnalyticStatsParamEntity>,
  ) {}

  @OnEvent('analytic-oee.update')
  async handleAnalyticOeeUpdateEvent(event: AnalyticOeeUpdateEvent) {
    const { batchId, oeeStats } = event;
    await this.collectOeeStatsFromBatch(batchId, oeeStats);
  }

  @OnEvent('analytic-a-params.update')
  async handleAnalyticAParamsUpdateEvent(event: AnalyticAParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, params } = event;
    const timestamp = dayjs().startOf('s');
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_A,
        timestamp: timestamp.toDate(),
        siteId,
        oeeId,
        oeeBatchId,
        productId,
      })),
    );
  }

  @OnEvent('analytic-p-params.update')
  async handleAnalyticPParamsUpdateEvent(event: AnalyticPParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, params } = event;
    const timestamp = dayjs().startOf('s');
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_P,
        timestamp: timestamp.toDate(),
        siteId,
        oeeId,
        oeeBatchId,
        productId,
      })),
    );
  }

  @OnEvent('analytic-q-params.update')
  async handleAnalyticQParamsUpdateEvent(event: AnalyticQParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, params } = event;
    const timestamp = dayjs().startOf('s');
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_Q,
        timestamp: timestamp.toDate(),
        siteId,
        oeeId,
        oeeBatchId,
        productId,
      })),
    );
  }

  async collectOeeStatsFromBatch(batchId: number, currentOeeStats: OeeStats): Promise<void> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { siteId, oeeId, product, standardSpeedSeconds } = batch;

    const currentTime = dayjs().minute() < 30 ? dayjs().startOf('h') : dayjs().startOf('h').add(30, 'm');
    const previousStats = await this.oeeBatchStatsRepository
      .createQueryBuilder()
      .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
      .andWhere('timestamp >= :from and timestamp <= :to', {
        from: currentTime.add(-30, 'm').toDate(),
        to: currentTime.toDate(),
      })
      .orderBy({ timestamp: 'DESC' })
      .getOne();

    const lastCutoffData = previousStats ? previousStats.data : initialOeeBatchStats;
    const {
      runningSeconds,
      plannedDowntimeSeconds,
      machineSetupSeconds,
      totalCount,
      totalBreakdownSeconds,
      totalStopSeconds,
      totalSpeedLossSeconds,
      totalMinorStopSeconds,
      totalManualDefects,
      totalAutoDefects,
      totalOtherDefects,
    } = currentOeeStats;

    const newData: AnalyticData = {
      standardSpeedSeconds: standardSpeedSeconds,
      runningSeconds: runningSeconds - lastCutoffData.runningSeconds,
      plannedDowntimeSeconds: plannedDowntimeSeconds - lastCutoffData.plannedDowntimeSeconds,
      machineSetupSeconds: machineSetupSeconds - lastCutoffData.machineSetupSeconds,
      totalCount: totalCount - lastCutoffData.totalCount,
      totalBreakdownSeconds: totalBreakdownSeconds - lastCutoffData.totalBreakdownSeconds,
      totalStopSeconds: totalStopSeconds - lastCutoffData.totalStopSeconds,
      totalSpeedLossSeconds: totalSpeedLossSeconds - lastCutoffData.totalSpeedLossSeconds,
      totalMinorStopSeconds: totalMinorStopSeconds - lastCutoffData.totalMinorStopSeconds,
      totalManualDefects: totalManualDefects - lastCutoffData.totalManualDefects,
      totalAutoDefects: totalAutoDefects - lastCutoffData.totalAutoDefects,
      totalOtherDefects: totalOtherDefects - lastCutoffData.totalOtherDefects,
    };

    const existingStats = await this.analyticStatsRepository.findOneBy({
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      timestamp: currentTime.toDate(),
    });

    await this.analyticStatsRepository.save({
      ...existingStats,
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
      timestamp: currentTime.toDate(),
      data: newData,
    });
  }
}
