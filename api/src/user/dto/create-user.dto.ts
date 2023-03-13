import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmailExists } from '../../common/validations/email-exists.validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
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
}
