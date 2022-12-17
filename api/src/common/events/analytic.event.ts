import { OeeStats } from '../type/oee-stats';
import { OeeBatchA } from '../entities/oee-batch-a';
import { OeeBatchP } from '../entities/oee-batch-p';
import { OeeBatchQ } from '../entities/oee-batch-q';
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
  param: AnalyticAParam;
}

export class AnalyticPParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  param: AnalyticPParam;
}

export class AnalyticQParamUpdateEvent {
  siteId: number;
  oeeId: number;
  productId: number;
  oeeBatchId: number;
  param: AnalyticQParam;
}
