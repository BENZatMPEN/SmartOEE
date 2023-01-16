import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { Transform, Type } from 'class-transformer';

export class CreateAdminUserDto {
  @IsString()
  @IsEmail()
  @EmailExists()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isAdmin: boolean;

  @IsArray()
  @Type(() => Number)
  @IsOptional()
  readonly siteIds: number[];
}
