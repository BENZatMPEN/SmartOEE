import { PercentSetting } from './percent-settings';
import { OEE_BATCH_STATUS_UNKNOWN } from '../constant';

export class OeeStatus {
  readonly running: number;
  readonly breakdown: number;
  readonly ended: number;
  readonly standby: number;
  readonly oees: OeeStatusItem[];
}

export class OeeStatusItem {
  readonly id: number;
  readonly oeeBatchId: number;
  readonly oeeCode: string;
  readonly productionName: string;
  readonly actual: number;
  readonly plan: number;
  readonly target: number;
  readonly oeePercent: number;
  readonly lotNumber: string;
  readonly batchStatus: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly useSitePercentSettings: boolean;
  readonly percentSettings: PercentSetting[];
  readonly standardSpeedSeconds: number;
}

export class OeeBatchMcState {
  constructor(
    mcStatus: string,
    total: number,
    totalNg: number,
    batchStatus: string,
    stopSeconds: number,
    stopTimestamp: Date | null,
    timestamp: Date | null,
  ) {
    this.mcStatus = mcStatus;
    this.total = total;
    this.totalNg = totalNg;
    this.batchStatus = batchStatus;
    this.stopSeconds = stopSeconds;
    this.stopTimestamp = stopTimestamp;
    this.timestamp = timestamp;
  }

  mcStatus: string;
  total: number;
  totalNg: number;
  batchStatus: string;
  stopSeconds: number;
  stopTimestamp: Date | null;
  timestamp: Date | null;
}

export const initialOeeBatchMcState: OeeBatchMcState = {
  mcStatus: '0',
  total: 0,
  totalNg: 0,
  batchStatus: OEE_BATCH_STATUS_UNKNOWN,
  stopSeconds: 0,
  stopTimestamp: null,
  timestamp: null,
};
