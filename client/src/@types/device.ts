import { DeviceModel, DeviceModelTag } from './deviceModel';

export type Device = {
  id: number;
  name: string;
  remark: string;
  deviceId: number;
  address: string;
  port: number;
  stopped: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceModelId: number;
  deviceModel: DeviceModel;
  tags: DeviceTag[];
  siteId: number;
};

export type EditDevice = {
  name: string;
  remark: string;
  deviceId: number;
  address: string;
  port: number;
  stopped: boolean;
  deviceModelId: number | null;
  tags: DeviceTag[];
};

export type FilterDevice = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};

export type DeviceTag = {
  id: number;
  name: string;
  spLow: number;
  spHigh: number;
  updateInterval: string;
  record: boolean;
  deviceId: number;
  deviceModelTagId: number;
  deviceModelTag?: DeviceModelTag;
};

export type DevicePagedList = {
  list: Device[];
  count: number;
};
