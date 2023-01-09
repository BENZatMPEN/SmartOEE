import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAnalyticDto {
  @IsString()
  readonly name: string;

  @IsObject()
  readonly data: any;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly group: boolean;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;
}
