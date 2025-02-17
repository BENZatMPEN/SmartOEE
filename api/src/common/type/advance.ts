export class Advance {
  id: number;
  siteId: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export class OeeData {
  aPercent: number;
  pPercent: number;
  qPercent: number;
  oeePercent: number;
  totalCount: number;
  runningSeconds: number;
  operatingSeconds: number;
  totalAutoDefects: number;
  totalStopSeconds: number;
  totalOtherDefects: number;
  totalManualDefects: number;
  machineSetupSeconds: number;
  totalBreakdownSeconds: number;
  totalMinorStopSeconds: number;
  totalSpeedLossSeconds: number;
  plannedDowntimeSeconds: number;
}

export class Interval {
  start: Date;
  end: Date;
}

export class OeeRecord {
  id: string;
  data: OeeData;
  oeeId: number;
  oeeBatchId: number;
  productId: number;
  intervalLabel: string;
  interval: Interval;
}

export interface OeeLossResult {
  oeeId: number;
  id: string;
  oeePercent: number;
  ALoss: number;
  PLoss: number;
  QLoss: number;
  timeslot: string;
}

export interface OeeStatusItem {
  id: number;
  oeeBatchId: number;
  oeeCode: string;
  productionName: string;
  actual: number;
  defect: number;
  plan: number;
  target: number;
  oeePercent: number;
  loadingFactorPercent: number;
  aPercent: number;
  qPercent: number;
  pPercent: number;
  lotNumber: string;
  batchStatus: string;
  startDate: Date;
  endDate: Date;
  useSitePercentSettings: number;
  percentSettings: any[];
  standardSpeedSeconds: number;
  productName: string;
  batchStartedDate: Date;
  batchStoppedDate: Date;
  activeSecondUnit: number;
}

export type OeeSumData = {
  name: string;
  runningSeconds: number;
  operatingSeconds: number;
  totalBreakdownSeconds: number;
  plannedDowntimeSeconds: number;
  machineSetupSeconds: number;
  totalCount: number;
  totalAutoDefects: number;
  totalManualDefects: number;
  totalOtherDefects: number;
  totalCountByBatch: {
    [key: string]: {
      lotNumber: string;
      standardSpeedSeconds: number;
      totalCount: number;
    };
  };
};

export type OeeStats = {
  oeeBatchId: number;
  oeeId: number;
  productId: number;
  timestamp: string;
  data: any;
};

export interface OeeLossGrouped {
  oeeId: number;
  lossResult: OeeLossResult[];
}

export interface CommonOeeData {
  aggregatedData: any[];
  oeeIds: number[];
  running: number;
  ended: number;
  standby: number;
  breakdown: number;
  mcSetup: number;
  user: any;
  statsRows: OeeStats[];
}

export interface AggregatedData {
  id: number;
  aPercent: number;
  pPercent: number;
  qPercent: number;
  oeePercent: number;
  name: string;
  runningSeconds: number;
  operatingSeconds: number;
  totalBreakdownSeconds: number;
  plannedDowntimeSeconds: number;
  machineSetupSeconds: number;
  totalCount: number;
  totalAutoDefects: number;
  totalManualDefects: number;
  totalOtherDefects: number;
}
