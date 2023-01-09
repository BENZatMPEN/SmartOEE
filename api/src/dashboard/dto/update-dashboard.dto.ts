import { IsString } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly link: string;
}
