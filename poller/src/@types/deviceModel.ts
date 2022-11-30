export type DeviceModel = {
  id: number;
  name: string;
  remark: string;
  modelType: string;
  connectionType: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  siteId: number;
  tags: DeviceModelTag[];
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
