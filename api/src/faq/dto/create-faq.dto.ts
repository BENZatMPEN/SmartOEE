import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFaqDto {
  @IsString()
  readonly topic: string;

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
  readonly createdByUserId: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly approvedByUserId: number;

  @IsString()
  readonly description: string;

  @IsString()
  readonly remark: string;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsString()
  readonly status: string;
}
