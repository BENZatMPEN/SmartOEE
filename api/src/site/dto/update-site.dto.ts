import { PercentSetting } from '../../common/type/percent-settings';
import { IsArray, IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AlertTemplate } from '../../common/type/alertTemplate';

export class UpdateSiteDto {
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

  @IsArray()
  @Type(() => PercentSetting)
  readonly defaultPercentSettings: PercentSetting[];

  @IsDate()
  @Type(() => Date)
  readonly cutoffTime: Date;

  @IsObject()
  @IsOptional()
  @Type(() => AlertTemplate)
  readonly alertTemplate: AlertTemplate;
}
