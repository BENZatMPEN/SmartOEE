export type ReadItem = {
  tagId: number;
  read: string;
};

export type DeviceTagResult = {
  readonly deviceId: number;
  readonly reads: ReadItem[];
};

export type TagRead = {
  siteId: number;
  timestamp: Date;
  deviceReads: DeviceTagResult[];
};
