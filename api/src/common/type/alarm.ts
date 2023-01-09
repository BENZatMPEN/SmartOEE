import { IsArray, IsBoolean, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AlarmCondition {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  aParams: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  pParams: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  qParams: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  aLow: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  pLow: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  qLow: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
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
