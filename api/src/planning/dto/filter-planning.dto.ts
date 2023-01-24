import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPlanningDto {
  @IsDate()
  @Type(() => Date)
  readonly start: Date;

  @IsDate()
  @Type(() => Date)
  readonly end: Date;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;
}
