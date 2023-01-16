import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  readonly currentPassword: string;

  @IsString()
  readonly newPassword: string;
}
