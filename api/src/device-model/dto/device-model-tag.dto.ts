export class DeviceModelTagDto {
  readonly id: number;
  readonly name: string;
  readonly address: number;
  readonly length: number;
  readonly dataType: string;
  readonly readFunc: number;
  readonly writeFunc: number;
  readonly writeState: boolean;
  readonly factor: number;
  readonly compensation: number;
  readonly deviceModelId: number;
}
