import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFaqDto {
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
  readonly approvedByUserId: number;

  @IsString()
  readonly description: string;

  @IsString()
  readonly remark: string;

  @IsString()
  readonly status: string;

  @IsArray()
  @Type(() => Number)
  @IsOptional()
  readonly deletingAttachments: number[];
}
