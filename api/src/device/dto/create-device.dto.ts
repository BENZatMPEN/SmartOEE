import { DeviceTagDto } from './device-tag.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;

  @IsNumber()
  @Type(() => Number)
  readonly deviceId: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly deviceModelId: number;

  @IsString()
  readonly address: string;

  @IsNumber()
  @Type(() => Number)
  readonly port: number;

  @IsBoolean()
  @Type(() => Boolean)
  readonly stopped: boolean;

  @IsArray()
  @Type(() => DeviceTagDto)
  readonly tags: DeviceTagDto[];
}
