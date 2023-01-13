import { AlarmCondition } from '../../common/type/alarm';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAlarmDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly type: string;

  @IsBoolean()
  @Type(() => Boolean)
  readonly notify: boolean;

  @IsOptional()
  readonly data: any;

  @IsObject()
  @Type(() => AlarmCondition)
  readonly condition: AlarmCondition;
}
