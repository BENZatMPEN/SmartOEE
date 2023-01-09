import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  readonly currentPassword: string;

  @IsString()
  readonly newPassword: string;
}
