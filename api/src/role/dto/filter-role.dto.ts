import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRoleDto {
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
