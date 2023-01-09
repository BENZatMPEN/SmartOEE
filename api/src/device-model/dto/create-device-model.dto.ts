import { DeviceModelTagDto } from './device-model-tag.dto';
import { IsArray, IsNumber, IsString } from 'class-validator';
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

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsArray()
  @Type(() => DeviceModelTagDto)
  readonly tags: DeviceModelTagDto[];
}
