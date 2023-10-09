import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProblemSolutionTaskDto {
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

  @IsNumber()
  @Type(() => Number)
  readonly order: number;
}
