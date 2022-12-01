import { DeviceModelTagDto } from './device-model-tag.dto';

export class CreateDeviceModelDto {
  readonly name: string;
  readonly remark: string;
  readonly modelType: string;
  readonly connectionType: string;
  readonly siteId: number;
  readonly tags: DeviceModelTagDto[];
}
