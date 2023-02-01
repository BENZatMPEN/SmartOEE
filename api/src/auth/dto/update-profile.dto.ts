import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { Type } from 'class-transformer';
import { REQUEST_PARAM_ID } from '../../common/interceptors/request-param.interceptor';

export class UpdateProfileDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;
}
