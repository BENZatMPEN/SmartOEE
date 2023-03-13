import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  readonly lineId: string;
}
