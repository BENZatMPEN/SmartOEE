import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { REQUEST_PARAM_ID } from '../../common/interceptors/request-param.interceptor';

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  @EmailExists()
  readonly email: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsNumber()
  @Type(() => Number)
  [REQUEST_PARAM_ID]: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  readonly isAdmin?: boolean;
}
