import { OeeStats } from '../type/oee-stats';
import { AnalyticAParam, AnalyticPParam, AnalyticQParam } from '../type/analytic-data';

export class AnalyticOeeUpdateEvent {
  batchId: number;
  oeeStats: OeeStats;

  constructor(batchId: number, oeeStats: OeeStats) {
    this.batchId = batchId;
    this.oeeStats = oeeStats;
  }
}

export class AnalyticAParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticAParam[];

  constructor(siteId: number, oeeId: number, productId: number, oeeBatchId: number, params: AnalyticAParam[]) {
    this.siteId = siteId;
    this.oeeId = oeeId;
    this.productId = productId;
    this.oeeBatchId = oeeBatchId;
    this.params = params;
  }
}

export class AnalyticPParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticPParam[];

  constructor(siteId: number, oeeId: number, productId: number, oeeBatchId: number, params: AnalyticPParam[]) {
    this.siteId = siteId;
    this.oeeId = oeeId;
    this.productId = productId;
    this.oeeBatchId = oeeBatchId;
    this.params = params;
  }
}

export class AnalyticQParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticQParam[];

  constructor(siteId: number, oeeId: number, productId: number, oeeBatchId: number, params: AnalyticQParam[]) {
    this.siteId = siteId;
    this.oeeId = oeeId;
    this.productId = productId;
    this.oeeBatchId = oeeBatchId;
    this.params = params;
  }
}
