import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { Type } from 'class-transformer';
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

  @IsString()
  @IsOptional()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  readonly lineId: string;

  @IsNumber()
  @Type(() => Number)
  readonly roleId: number;

  @IsArray()
  @Type(() => Number)
  @IsOptional()
  readonly siteIds: number[];

  @IsNumber()
  @Type(() => Number)
  [REQUEST_PARAM_ID]: number;
}
