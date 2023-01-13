import { IsArray, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AlarmCondition {
  @IsBoolean()
  @Type(() => Boolean)
  aParams: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  pParams: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  qParams: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  aLow: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  pLow: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  qLow: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  oeeLow: boolean;

  @IsArray()
  @Type(() => Number)
  oees: number[];
}

export class AlarmEmailDataItem {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class AlarmLineData {
  @IsString()
  token: string;
}
