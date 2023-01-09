import { Injectable, PipeTransform } from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  constructor(private readonly removingField: string) {}

  transform(value: any) {
    if (typeof value === 'object' && this.removingField in value) {
      return omit(value, this.removingField);
    }

    return value;
  }
}
