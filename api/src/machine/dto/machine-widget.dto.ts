import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MachineWidgetDto {
  @IsNumber()
  @Type(() => Number)
  readonly machineId: number;

  @IsArray()
  @Type(() => WidgetDto)
  readonly widgets: WidgetDto[];
}

export class WidgetDto {
  @IsNumber()
  @Type(() => Number)
  readonly id?: number;

  @IsString()
  readonly type: string;

  @IsObject()
  readonly data: any;

  @IsNumber()
  @Type(() => Number)
  readonly deviceId: number;

  @IsNumber()
  @Type(() => Number)
  readonly tagId: number;
}
