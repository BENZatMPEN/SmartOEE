import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { REQUEST_PARAM_ID } from '../interceptors/request-param.interceptor';

@Injectable()
@ValidatorConstraint({ async: true })
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(value: string, args?: ExtendedValidationArguments) {
    const paramId = args?.object[REQUEST_PARAM_ID];
    const user = await this.userService.findByEmail(value);
    if (user === null) {
      return true;
    }

    return user.id === paramId;
  }

  defaultMessage() {
    return `Email already exists`;
  }
}

export function EmailExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailExistsRule,
    });
  };
}

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_PARAM_ID]: number;
  };
}
