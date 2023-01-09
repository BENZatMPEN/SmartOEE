import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DeviceModelTagDto {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @IsString()
  readonly name: string;

  @IsNumber()
  @Type(() => Number)
  readonly address: number;

  @IsNumber()
  @Type(() => Number)
  readonly length: number;

  @IsString()
  readonly dataType: string;

  @IsNumber()
  @Type(() => Number)
  readonly readFunc: number;

  @IsNumber()
  @Type(() => Number)
  readonly writeFunc: number;

  @IsBoolean()
  @Type(() => Boolean)
  readonly writeState: boolean;

  @IsNumber()
  @Type(() => Number)
  readonly factor: number;

  @IsNumber()
  @Type(() => Number)
  readonly compensation: number;

  @IsNumber()
  @Type(() => Number)
  readonly deviceModelId: number;
}
