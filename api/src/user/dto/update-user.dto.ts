import { IsEmail, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsNumber()
  @Type(() => Number)
  readonly roleId: number;
}
