import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProblemSolutionTaskDto {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @IsString()
  readonly title: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly assigneeUserId: number;

  @IsDate()
  @Type(() => Date)
  readonly startDate: Date;

  @IsDate()
  @Type(() => Date)
  readonly endDate: Date;

  @IsString()
  readonly comment: string;

  @IsString()
  readonly status: string;

  @IsNumber()
  @Type(() => Number)
  readonly problemSolutionId: number;

  @IsArray()
  @Type(() => Number)
  @IsOptional()
  readonly deletingFiles: number[];

  @IsNumber()
  @Type(() => Number)
  readonly order: number;
}
