export type DeviceModel = {
  id: number;
  name: string;
  remark: string;
  modelType: string;
  connectionType: string;
  createdAt: Date;
  updatedAt: Date;
  siteId: number;
  tags: DeviceModelTag[];
};

export interface EditDeviceModel {
  name: string;
  remark: string;
  modelType: string;
  connectionType: string;
  tags: DeviceModelTag[];
}

export type FilterDeviceModel = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type DeviceModelTag = {
  id: number;
  name: string;
  address: number;
  length: number;
  dataType: string;
  readFunc: number;
  writeFunc: number;
  writeState: boolean;
  factor: number;
  compensation: number;
  createdAt: Date;
  updatedAt: Date;
  deviceModelId: number;
};

export type DeviceModelPagedList = {
  list: DeviceModel[];
  count: number;
};
