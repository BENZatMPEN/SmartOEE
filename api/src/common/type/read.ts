export class Read {
  readonly siteId: number;
  readonly connect: boolean;
  readonly timestamp: Date;
  readonly deviceId: number;
  readonly reads: ReadItem[];
}

export class ReadItem {
  readonly tagId: number;
  readonly read: string;
}
