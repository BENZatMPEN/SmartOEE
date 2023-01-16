import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class FilterUserDto {
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
}
