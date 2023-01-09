import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProblemSolutionDto {
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
  @IsOptional()
  readonly approveByUserId: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeId: number;

  @IsString()
  readonly remark: string;

  @IsString()
  readonly status: string;

  @IsArray()
  @Type(() => Number)
  @IsOptional()
  readonly deletingAttachments: number[];
}
