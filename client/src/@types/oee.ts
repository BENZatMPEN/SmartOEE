import { Machine } from './machine';
import { PercentSetting } from './percentSetting';
import { Product } from './product';

export type Oee = {
  id: number;
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
};

export type EditOee = {
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
};

export type FilterOee = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};

export type OeeProduct = {
  productId: number;
  standardSpeedSeconds: number;
  product?: Product;
};

export type OeeMachine = {
  machineId: number;
  machine?: Machine;
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
  oees: OeeStatusItem[];
};

export type OeeStatusItem = {
  id: number;
  oeeBatchId: number;
  oeeCode: string;
  productionName: string;
  actual: number;
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
};

export type OeePagedList = {
  list: Oee[];
  count: number;
};
