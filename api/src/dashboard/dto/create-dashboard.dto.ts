import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDashboardDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly link: string;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;
}
