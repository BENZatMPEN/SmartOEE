import { Machine } from './machine';
import { PercentSetting } from './percentSetting';
import { Product } from './product';
import { User } from './user';

export type Oee = {
  id: number;
  activeSecondUnit: boolean;
  oeeCode: string;
  oeeType: string;
  location: string;
  productionName: string;
  remark: string;
  imageName: string;
  minorStopSeconds: number;
  breakdownSeconds: number;
  oeeProducts: OeeProduct[];
  oeeMachines: OeeMachine[];
  siteId: number;
  tags: OeeTag[];
  percentSettings: PercentSetting[] | null;
  useSitePercentSettings: boolean;
  timeUnit: string;
  createdAt: Date;
  updatedAt: Date;
  operators: User[];
  workShifts: WorkShiftsDetail[];
};

export interface EditOee {
  activeSecondUnit: boolean;
  oeeCode: string;
  oeeType: string;
  location: string;
  productionName: string;
  remark: string;
  image: File | null;
  minorStopSeconds: number;
  breakdownSeconds: number;
  oeeProducts: OeeProduct[];
  oeeMachines: OeeMachine[];
  siteId?: number;
  tags: OeeTag[];
  percentSettings: PercentSetting[] | null;
  useSitePercentSettings: boolean;
  timeUnit: string;
  operators: User[];
  workShifts: WorkShiftsDetail[];
}

export type FilterOee = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type OeeProduct = {
  productId: number;
  standardSpeedSeconds: number;
  product?: Product;
};

export type OeeMachine = {
  machineId: number;
  machine?: Machine;
  oeeMachinePlannedDowntime?: MachinePlanDownTime[];
};

export type OeeTag = {
  key: string;
  data: any;
  deviceId: number;
  tagId: number;
};

export type OeeStatus = {
  running: number;
  breakdown: number;
  ended: number;
  standby: number;
  mcSetup: number;
  oees: OeeStatusItem[];
};

export type OeeStatusItem = {
  id: number;
  oeeBatchId: number;
  oeeCode: string;
  productionName: string;
  actual: number;
  defect: number;
  plan: number;
  target: number;
  oeePercent: number;
  lotNumber: string;
  batchStatus: string;
  startDate: Date;
  endDate: Date;
  useSitePercentSettings: boolean;
  percentSettings: PercentSetting[];
  standardSpeedSeconds: number;
  productName: string;
  batchStartedDate: Date;
  batchStoppedDate: Date;
  activeSecondUnit: boolean;
};

export type OeePagedList = {
  list: Oee[];
  count: number;
};

export type MachinePlanDownTime = {
  machineId: number;
  plannedDownTimeId: number;
  namePlannedDownTime: string;
  startDate: Date;
  endDate: Date;
  fixTime: boolean;
};
export type Shift = {
  name: string;
  active: boolean;
  start: Date; // e.g., "08:00"
  end: Date; // e.g., "17:00"
};

// Type for a single day's data
export type DayData = {
  day: string; // e.g., "Monday"
  active: boolean; // Whether the entire day is active
  shifts: {
    day: Shift;
    ot: Shift;
    night: Shift;
  };
};
export interface WorkShiftsDetailAPIS {
  oeeId: number;
  dayOfWeek: string;
  shiftNumber: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  isDayActive: boolean;
  isShiftActive: boolean;
}

export interface ShiftWork {
  id?: number | null | undefined;
  shiftNumber: number;
  shiftName: string;
  startTime: Date | string;
  endTime: Date | string;
  isShiftActive: boolean;
}
export interface WorkShiftsDetail {
  oeeId?: number | null | undefined;
  dayOfWeek: string;
  isDayActive: boolean;
  shifts: ShiftWork[];
}

export interface ExportToAnotherOee {
  workShifts: WorkShiftsDetail[];
  oeeIds: number[];
}

export type OeeStatusAdvanced = {
  running: number;
  breakdown: number;
  ended: number;
  standby: number;
  mcSetup: number;
  oees: OeeStatusAdvancedItem[];
  lossOees?: OeeStatusLossAdvancedItem[];
  columns?: AndonStatusAdvancedItem[];
  oeeGroups?: AndonGroupAdvancedItem[];
  lossHourly? : OeeStatusLossAdvancedItem[]
};

export type AndonGroupAdvancedItem = {
  groupName: string;
  oees: OeeStatusAdvancedItem[];
};

export type AndonStatusAdvancedItem = {
  id: number;
  columnName: string;
  columnValue: string;
  columnOrder: number;
  deleted: boolean;
  siteId: number;
};

export type AndonColumns = Omit<AndonStatusAdvancedItem, 'siteId'>;

export type updateColumnsReq = {
  siteId: number;
  andonColumns: AndonColumns[];
};

export type OeeStatusAdvancedItem = {
  id: number;
  oeeBatchId: number;
  oeeCode: string;
  productionName: string;
  actual: number;
  defect: number;
  plan: number;
  target: number;
  oeePercent: number;
  lotNumber: string;
  batchStatus: string;
  startDate: Date;
  endDate: Date;
  useSitePercentSettings: boolean;
  loadingFactorPercent : number;
  percentSettings: PercentSetting[];
  standardSpeedSeconds: number;
  productName: string;
  batchStartedDate: Date;
  batchStoppedDate: Date;
  activeSecondUnit: boolean;
  qPercent: number;
  pPercent: number;
  aPercent: number;
};

export type OeeStatusLossAdvancedItem = {
  lossResult: OeeStatusLossResultAdvancedItem[];
  oeeId: number;
};

export type OeeStatusLossResultAdvancedItem = {
  oeeId: number;
  id: string;
  oeePercent: number;
  aLoss: number;
  pLoss: number;
  qLoss: number;
  lLoss?: number;
  timeslot: string;
  timestamp: string;
};
