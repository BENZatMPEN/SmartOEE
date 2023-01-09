import { IsNumber, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PercentSettingItem {
  @IsNumber()
  @Type(() => Number)
  high: number;

  @IsNumber()
  @Type(() => Number)
  medium: number;

  @IsNumber()
  @Type(() => Number)
  low: number;
}

export class PercentSetting {
  @IsString()
  type: string;

  @IsObject()
  @Type(() => PercentSettingItem)
  settings: PercentSettingItem;
}
