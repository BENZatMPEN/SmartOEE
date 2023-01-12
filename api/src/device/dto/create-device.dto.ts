import { DeviceTagDto } from './device-tag.dto';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => value === 'true')
  readonly stopped: boolean;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsArray()
  @Type(() => DeviceTagDto)
  readonly tags: DeviceTagDto[];
}
