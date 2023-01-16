import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProblemSolutionDto {
  @IsString()
  readonly name: string;

  @IsDate()
  @Type(() => Date)
  readonly date: Date;

  @IsDate()
  @Type(() => Date)
  readonly startDate: Date;

  @IsDate()
  @Type(() => Date)
  readonly endDate: Date;

  @IsNumber()
  @Type(() => Number)
  readonly headProjectUserId: number;

  @IsNumber()
  @Type(() => Number)
  readonly approvedByUserId: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeId: number;

  @IsString()
  readonly remark: string;

  @IsString()
  readonly status: string;
}
