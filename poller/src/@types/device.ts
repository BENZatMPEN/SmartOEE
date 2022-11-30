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
  deleted: boolean;
  deviceModel: DeviceModel;
  siteId: number;
  tags: DeviceTag[];
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
  deviceModelTag: DeviceModelTag;
};
