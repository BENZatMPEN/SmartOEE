export class Read {
  readonly siteId: number;
  readonly timestamp: Date;
  deviceReads: DeviceTagResult[];
}

export class ReadItem {
  readonly tagId: number;
  readonly read: string;
}

export class DeviceTagResult {
  readonly deviceId: number;
  readonly reads: ReadItem[];
}
