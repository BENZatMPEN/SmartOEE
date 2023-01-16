import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OeeTag {
  @IsString()
  readonly key: string;

  @IsString()
  readonly data: any;

  @IsNumber()
  @Type(() => Number)
  readonly deviceId: number;

  @IsNumber()
  @Type(() => Number)
  readonly tagId: number;
}

export class OeeTagMCStatus {
  readonly running: string;
  readonly standby: string;
}

export type OeeTagOutBatchStatus = {
  standby: string;
  running: string;
  breakdown: string;
  plannedDowntimeManual: string;
  plannedDowntimeAuto: string;
  mcSetup: string;
};

export type OeeTagOutReset = {
  reset: string;
};
