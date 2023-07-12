import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AnalyticAParamUpdateEvent,
  AnalyticPParamUpdateEvent,
  AnalyticQParamUpdateEvent,
} from '../events/analytic.event';
import { InjectRepository } from '@nestjs/typeorm';
import { OeeBatchEntity } from '../entities/oee-batch.entity';
import { Repository } from 'typeorm';
import { OeeBatchStatsEntity } from '../entities/oee-batch-stats.entity';
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
    @InjectRepository(AnalyticStatsParamEntity)
    private readonly analyticStatsParamRepository: Repository<AnalyticStatsParamEntity>,
  ) {}

  @OnEvent('analytic-a-params.update', { async: true })
  async handleAnalyticAParamsUpdateEvent(event: AnalyticAParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, timestamp, params } = event;
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_A,
        siteId,
        oeeId,
        oeeBatchId,
        productId,
        timestamp,
      })),
    );
  }

  @OnEvent('analytic-p-params.update', { async: true })
  async handleAnalyticPParamsUpdateEvent(event: AnalyticPParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, timestamp, params } = event;
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_P,
        siteId,
        oeeId,
        oeeBatchId,
        productId,
        timestamp,
      })),
    );
  }

  @OnEvent('analytic-q-params.update', { async: true })
  async handleAnalyticQParamsUpdateEvent(event: AnalyticQParamUpdateEvent) {
    const { siteId, oeeId, productId, oeeBatchId, timestamp, params } = event;
    await this.analyticStatsParamRepository.save(
      params.map((param) => ({
        data: param,
        paramType: OEE_PARAM_TYPE_Q,
        siteId,
        oeeId,
        oeeBatchId,
        productId,
        timestamp,
      })),
    );
  }
}
