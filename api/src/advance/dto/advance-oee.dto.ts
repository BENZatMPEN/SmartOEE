import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvanceOee {
  @IsDate()
  @Type(() => Date)
  readonly from: Date;

  @IsDate()
  @Type(() => Date)
  readonly to: Date;

  @IsNumber()
  @Type(() => Number)
  readonly userId: number;
}
