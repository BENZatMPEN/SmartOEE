import { DeviceModelTagDto } from './device-model-tag.dto';
import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceModelDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;

  @IsString()
  readonly modelType: string;

  @IsString()
  readonly connectionType: string;

  @IsArray()
  @Type(() => DeviceModelTagDto)
  readonly tags: DeviceModelTagDto[];
}
