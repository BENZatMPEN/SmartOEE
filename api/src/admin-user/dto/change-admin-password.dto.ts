import { IsString } from 'class-validator';

export class AdminChangePasswordDto {
  @IsString()
  readonly currentPassword: string;

  @IsString()
  readonly newPassword: string;
}
