import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  readonly password: string;
}
