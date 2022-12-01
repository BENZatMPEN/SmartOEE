import { DeviceTagDto } from './device-tag.dto';

export class CreateDeviceDto {
  readonly name: string;
  readonly remark: string;
  readonly deviceId: number;
  readonly deviceModelId: number;
  readonly address: string;
  readonly port: number;
  readonly stopped: boolean;
  readonly siteId: number;
  readonly tags: DeviceTagDto[];
}
