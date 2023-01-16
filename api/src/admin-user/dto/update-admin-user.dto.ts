import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { REQUEST_PARAM_ID } from '../../common/interceptors/request-param.interceptor';

export class UpdateAdminUserDto {
  @IsString()
  @IsEmail()
  @EmailExists()
  readonly email: string;

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

  @IsNumber()
  @Type(() => Number)
  [REQUEST_PARAM_ID]: number;
}
