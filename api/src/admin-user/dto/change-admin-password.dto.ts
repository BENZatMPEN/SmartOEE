import { IsString } from 'class-validator';

export class AdminChangePasswordDto {
  @IsString()
  readonly password: string;
}
