import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterHistoryLogDto {
  @IsString()
  readonly search: string;

  @IsString()
  readonly order: string;

  @IsString()
  readonly orderBy: string;

  @IsNumber()
  @Type(() => Number)
  readonly page: number;

  @IsNumber()
  @Type(() => Number)
  readonly rowsPerPage: number;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsString()
  readonly type: string;

  @IsDate()
  @Type(() => Date)
  readonly fromDate: Date;

  @IsDate()
  @Type(() => Date)
  readonly toDate: Date;
}
