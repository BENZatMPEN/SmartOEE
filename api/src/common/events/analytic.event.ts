import { OeeStats } from '../type/oee-stats';
import { AnalyticAParam, AnalyticPParam, AnalyticQParam } from '../type/analytic-data';

export class AnalyticOeeUpdateEvent {
  batchId: number;
  oeeStats: OeeStats;
}

export class AnalyticAParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticAParam[];
}

export class AnalyticPParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticPParam[];
}

export class AnalyticQParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  params: AnalyticQParam[];
}
