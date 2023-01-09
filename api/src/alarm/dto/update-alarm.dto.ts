import { AlarmCondition } from '../../common/type/alarm';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateAlarmDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly type: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly notify: boolean;

  @IsObject()
  readonly data: any;

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsObject()
  @Type(() => AlarmCondition)
  readonly condition: AlarmCondition;
}
