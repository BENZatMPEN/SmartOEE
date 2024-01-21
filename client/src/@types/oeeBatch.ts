import { Machine } from './machine';
import { Product } from './product';

export type OeeBatch = {
  id: number;
  startDate: Date;
  endDate: Date;
  batchStartedDate: Date;
  batchStoppedDate: Date;
  minorStopSeconds: number;
  breakdownSeconds: number;
  standardSpeedSeconds: number;
  plannedQuantity: number;
  targetQuantity: number;
  oeeStats: OeeStats;
  machines: Machine[];
  status: string;
  speedStatus: string;
  siteId: number;
  oeeId: number;
  // oee: Oee;
  productId: number;
  product: Product;
  lotNumber: string;
  // plannedDowntimes: OeeBatchPlannedDowntime[];
  // changes: OeeBatchChange[];
  aParams: OeeBatchA[];
  pParams: OeeBatchP[];
  qParams: OeeBatchQ[];
  createdAt: Date;
  updatedAt: Date;
  mcState: OeeBatchMcState;
  toBeStopped: boolean;
};

export type FilterOeeBatch = {
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  oeeId: number;
};

export type OeeBatchA = {
  id: number;
  seconds: number;
  timestamp: Date;
  tagId: number | null;
  // tag: DeviceTag;
  oeeBatchId: number;
  // oeeBatch: OeeBatch;
  machineId: number | null;
  // machine?: Machine;
  machineParameterId: number | null;
  // machineParameter?: MachineParameter;
  createdAt: Date;
  updatedAt: Date;
};

export type OeeBatchP = {
  id: number;
  seconds: number;
  timestamp: Date;
  isSpeedLost: boolean;
  tagId: number | null;
  // tag: DeviceTag;
  oeeBatchId: number;
  // oeeBatch: OeeBatch;
  machineId: number | null;
  // machine?: Machine;
  machineParameterId: number | null;
  // machineParameter?: MachineParameter;
  createdAt: Date;
  updatedAt: Date;
};

export type OeeBatchQ = {
  id: number;
  autoAmount: number;
  manualAmount: number;
  // totalAmount: number;
  // timestamp: Date;
  tagId: number | null;
  // tag: DeviceTag;
  oeeBatchId: number;
  // oeeBatch: OeeBatch;
  machineId: number | null;
  // machine?: Machine;
  machineParameterId: number | null;
  // machineParameter?: MachineParameter;
  grams: string
  manualAmountGram: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OeeStats = {
  readonly aPercent: number;
  readonly pPercent: number;
  readonly qPercent: number;
  readonly oeePercent: number;

  readonly runningSeconds: number;
  readonly operatingSeconds: number;
  readonly plannedDowntimeSeconds: number;
  readonly machineSetupSeconds: number;

  readonly totalCount: number;

  readonly totalBreakdownCount: number;
  readonly totalBreakdownSeconds: number;
  readonly totalStopSeconds: number;

  readonly totalSpeedLossCount: number;
  readonly totalSpeedLossSeconds: number;
  readonly totalMinorStopCount: number;
  readonly totalMinorStopSeconds: number;

  readonly totalManualDefects: number;
  readonly totalAutoDefects: number;
  readonly totalOtherDefects: number;
  readonly totalManualGrams: number;

  readonly target: number;
  readonly efficiency: number;
};

export type OeeBatchStatusLog = {
  readonly id: number;
  readonly data: OeeStats;
  readonly status: string;
  readonly timestamp: Date;
  readonly oeeId: number;
  readonly oeeBatchId: number;
  readonly createdAt: Date;
};

export type OeeTimeline = {
  status: string;
  fromDate: Date;
  toDate: Date;
  currentDate: Date;
};

export type OeeBatchStats = {
  timestamp: Date;
  data: {
    aPercent: number;
    pPercent: number;
    qPercent: number;
    oeePercent: number;
  };
};

export type OeeBatchMcState = {
  mcStatus: string;
  total: number;
  totalNg: number;
  stopSeconds: number;
  batchStatus: string;
  timestamp: Date;
};

export type OeeBatchPagedList = {
  list: OeeBatch[];
  count: number;
};

export type OeeBatchParamParetoData = {
  labels: string[];
  counts: number[];
  percents: number[];
};
