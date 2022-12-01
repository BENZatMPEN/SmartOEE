export class DeviceTagDto {
  readonly id: number;
  readonly name: string;
  readonly spLow: number;
  readonly spHigh: number;
  readonly updateInterval: string;
  readonly record: boolean;
  readonly deviceModelTagId: number;
}
