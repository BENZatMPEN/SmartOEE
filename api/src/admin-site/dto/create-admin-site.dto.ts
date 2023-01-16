import { PercentSetting } from '../../common/type/percent-settings';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAdminSiteDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly address: string;

  @IsString()
  readonly remark: string;

  @IsNumber()
  @Type(() => Number)
  readonly lat: number;

  @IsNumber()
  @Type(() => Number)
  readonly lng: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly sync: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  readonly active?: boolean;

  @IsArray()
  @Type(() => PercentSetting)
  readonly defaultPercentSettings: PercentSetting[];

  @IsNumber()
  @Type(() => Number)
  readonly oeeLimit: number;

  @IsNumber()
  @Type(() => Number)
  readonly userLimit: number;

  @IsDate()
  @Type(() => Date)
  readonly cutoffTime: Date;
}
