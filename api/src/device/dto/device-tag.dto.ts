import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DeviceTagDto {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @IsString()
  readonly name: string;

  @IsNumber()
  @Type(() => Number)
  readonly spLow: number;

  @IsNumber()
  @Type(() => Number)
  readonly spHigh: number;

  @IsString()
  readonly updateInterval: string;

  @IsBoolean()
  @Type(() => Boolean)
  readonly record: boolean;

  @IsNumber()
  @Type(() => Number)
  readonly deviceModelTagId: number;
}
