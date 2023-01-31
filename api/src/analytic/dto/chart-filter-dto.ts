import { IsArray, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ChartFilterDto {
  @IsString()
  readonly type: string;

  @IsArray()
  @Type(() => Number)
  readonly ids: number[];

  @IsString()
  readonly duration: string;

  @IsString()
  readonly viewType: string;

  @IsDate()
  @Type(() => Date)
  readonly from: Date;

  @IsDate()
  @Type(() => Date)
  readonly to: Date;
}
