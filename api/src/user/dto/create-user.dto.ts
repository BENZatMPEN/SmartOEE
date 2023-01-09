import { IsEmail, IsNumber, IsString } from 'class-validator';
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

  @IsNumber()
  @Type(() => Number)
  readonly roleId: number;
}
