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

  @OnEvent('analytic-oee.update', { async: true })
  async handleAnalyticOeeUpdateEvent(event: AnalyticOeeUpdateEvent) {
    const { batchId, oeeStats } = event;
    await this.collectOeeStatsFromBatch(batchId, oeeStats);
  }

  @OnEvent('analytic-a-params.update', { async: true })
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

  @OnEvent('analytic-p-params.update', { async: true })
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

  @OnEvent('analytic-q-params.update', { async: true })
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

  private async collectOeeStatsFromBatch(batchId: number, currentOeeStats: OeeStats): Promise<void> {
    const batch = await this.oeeBatchRepository.findOneBy({ id: batchId });
    const { siteId, oeeId, product, standardSpeedSeconds } = batch;

    const cutoffTime = 30;
    const currentTime = dayjs().minute() < cutoffTime ? dayjs().startOf('h') : dayjs().startOf('h').add(30, 'm');
    const previousTime = currentTime.add(-cutoffTime, 'm');

    // adjust the previous in case of timelapse
    const count = await this.analyticStatsRepository.countBy({
      siteId,
      oeeId,
      productId: product.id,
      oeeBatchId: batch.id,
    });

    // 2 possible cases
    if (count >= 2) {
      const analyticStats = await this.analyticStatsRepository.findOneBy({
        siteId,
        oeeId,
        productId: product.id,
        oeeBatchId: batch.id,
        timestamp: previousTime.toDate(),
      });

      // 1) first record of analytic - just get the last record of the period
      // count === 2, the first and the current
      if (count === 2) {
        // previous period 11:00:00 - 11:29:59
        // current period 11:30:00 - 11:59:59
        const batchStats = await this.oeeBatchStatsRepository
          .createQueryBuilder()
          .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
          .andWhere('timestamp >= :from and timestamp <= :to', {
            from: previousTime.toDate(),
            to: currentTime.add(-1).toDate(),
          })
          .orderBy({ timestamp: 'DESC' })
          .getOne();

        const data: AnalyticData = {
          standardSpeedSeconds: standardSpeedSeconds,
          runningSeconds: batchStats.data.runningSeconds,
          plannedDowntimeSeconds: batchStats.data.plannedDowntimeSeconds,
          machineSetupSeconds: batchStats.data.machineSetupSeconds,
          totalCount: batchStats.data.totalCount,
          totalBreakdownSeconds: batchStats.data.totalBreakdownSeconds,
          totalStopSeconds: batchStats.data.totalStopSeconds,
          totalSpeedLossSeconds: batchStats.data.totalSpeedLossSeconds,
          totalMinorStopSeconds: batchStats.data.totalMinorStopSeconds,
          totalManualDefects: batchStats.data.totalManualDefects,
          totalAutoDefects: batchStats.data.totalAutoDefects,
          totalOtherDefects: batchStats.data.totalOtherDefects,
        };

        await this.analyticStatsRepository.save({
          ...analyticStats,
          data,
        });
      }
      // 2) n>1-record of analytic - get the last record of the previous period and the last record of the previous previous period then diff
      else {
        // 12:00:01 - the current (12:00:00 - 12:29:59)
        // 11:59:58 - last of the previous period (11:30:00 - 11:59:59)
        // 11:29:59 - last of the previous previous period (11:00:00 - 11:29:59)
        // (11:59:58) - (11:29:59)

        // 11:29:59
        const batchStats1 = await this.oeeBatchStatsRepository
          .createQueryBuilder()
          .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
          .andWhere('timestamp >= :from and timestamp <= :to', {
            from: previousTime.add(-cutoffTime, 'm').toDate(),
            to: previousTime.add(-1).toDate(),
          })
          .orderBy({ timestamp: 'DESC' })
          .getOne();

        // 11:59:58
        const batchStats2 = await this.oeeBatchStatsRepository
          .createQueryBuilder()
          .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
          .andWhere('timestamp >= :from and timestamp <= :to', {
            from: previousTime.toDate(),
            to: currentTime.add(-1).toDate(),
          })
          .orderBy({ timestamp: 'DESC' })
          .getOne();

        const data: AnalyticData = {
          standardSpeedSeconds: standardSpeedSeconds,
          runningSeconds: batchStats2.data.runningSeconds - batchStats1.data.runningSeconds,
          plannedDowntimeSeconds: batchStats2.data.plannedDowntimeSeconds - batchStats1.data.plannedDowntimeSeconds,
          machineSetupSeconds: batchStats2.data.machineSetupSeconds - batchStats1.data.machineSetupSeconds,
          totalCount: batchStats2.data.totalCount - batchStats1.data.totalCount,
          totalBreakdownSeconds: batchStats2.data.totalBreakdownSeconds - batchStats1.data.totalBreakdownSeconds,
          totalStopSeconds: batchStats2.data.totalStopSeconds - batchStats1.data.totalStopSeconds,
          totalSpeedLossSeconds: batchStats2.data.totalSpeedLossSeconds - batchStats1.data.totalSpeedLossSeconds,
          totalMinorStopSeconds: batchStats2.data.totalMinorStopSeconds - batchStats1.data.totalMinorStopSeconds,
          totalManualDefects: batchStats2.data.totalManualDefects - batchStats1.data.totalManualDefects,
          totalAutoDefects: batchStats2.data.totalAutoDefects - batchStats1.data.totalAutoDefects,
          totalOtherDefects: batchStats2.data.totalOtherDefects - batchStats1.data.totalOtherDefects,
        };

        await this.analyticStatsRepository.save({
          ...analyticStats,
          data,
        });
      }
    }

    // update the current
    const previousBatchStats = await this.oeeBatchStatsRepository
      .createQueryBuilder()
      .where(`oeeBatchId = :oeeBatchId`, { oeeBatchId: batchId })
      .andWhere('timestamp >= :from and timestamp <= :to', {
        from: previousTime.toDate(),
        to: currentTime.add(-1).toDate(),
      })
      .orderBy({ timestamp: 'DESC' })
      .getOne();

    const lastCutoffData = previousBatchStats ? previousBatchStats.data : initialOeeBatchStats;
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

    const data: AnalyticData = {
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
      data,
    });
  }
}
