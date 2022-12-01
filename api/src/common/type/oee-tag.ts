export class OeeTag {
  readonly key: string;
  readonly data: any;
  readonly deviceId: number;
  readonly tagId: number;
}

export class OeeTagMCStatus {
  readonly running: string;
  readonly standby: string;
  readonly off: string;
}
